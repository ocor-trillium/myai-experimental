# Trillium · MyAI (experimental)

Base template to experiment with Trillium's in-house AI, built with
**React 18 + TypeScript + Vite** and ready to run in production behind an
HTTPS edge.

---

## Requirements

- Node.js `>= 20.11` (see [`.nvmrc`](./.nvmrc))
- npm `>= 10.2`
- Docker `>= 24` (only required for the production image)

```bash
nvm use
npm ci
```

## Scripts

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Dev server with HMR on `127.0.0.1:5173`       |
| `npm run build`        | Typecheck + production bundle into `dist/`    |
| `npm run preview`      | Serves `dist/` locally for a quick smoke test |
| `npm run typecheck`    | Type-checks the project without emitting      |
| `npm run lint`         | Runs ESLint over the whole project            |
| `npm run lint:fix`     | ESLint with autofix                           |
| `npm run format`       | Writes Prettier formatting                    |
| `npm run format:check` | Verifies formatting (used in CI)              |

## Project layout

```
.
├── public/                 # Static assets served as-is
├── src/
│   ├── components/         # Reusable components (includes ErrorBoundary)
│   ├── config/env.ts       # Typed reader for VITE_* variables
│   ├── styles/             # Global CSS
│   ├── App.tsx
│   └── main.tsx
├── nginx/                  # Production runtime configuration
├── Dockerfile              # Hardened multi-stage build
├── vite.config.ts
└── tsconfig*.json
```

## Environment variables

- Only variables prefixed with `VITE_` are inlined into the browser bundle.
- **Anything shipped to the client must be considered public.** Never put API
  keys, tokens or secrets in frontend `.env*` files; handle them in a backend
  or BFF.
- Copy [`.env.example`](./.env.example) to `.env.local` for local development.

```bash
cp .env.example .env.local
```

---

## Running in production

The production runtime is a static SPA served by **nginx (unprivileged)** from
a hardened multi-stage Docker image. Follow these steps **in order**.

### 1. Pre-flight (CI gate)

Every commit going to production **must** pass these checks. They are the
exact gates wired into [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

```bash
npm ci --no-audit --no-fund --ignore-scripts
npm run format:check
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=high
```

If any step fails, **stop**. Do not ship.

### 2. Configure production environment variables

Production values are baked into the bundle at **build time** because Vite
inlines `VITE_*` variables. There is no runtime override.

Create a build-time `.env.production` (or export the vars in CI before
`npm run build`):

```env
VITE_APP_ENV=production
VITE_APP_VERSION=<git-sha-or-tag>
VITE_API_BASE_URL=https://api.your-domain.example
```

Rules:

- **Never** put secrets here. Anything that ends up in `dist/` is public.
- Pin `VITE_APP_VERSION` to the immutable commit SHA or release tag — this is
  what gets surfaced in error reports.
- `VITE_API_BASE_URL` must be HTTPS in production.

### 3. Build the production image

```bash
docker build \
  --pull \
  --no-cache \
  -t trillium/myai-experimental:<git-sha> \
  .
```

What the build does:

1. **Stage 1** (`node:20.18.2-alpine`): runs `npm ci --ignore-scripts` against
   the committed lockfile and produces `dist/`.
2. **Stage 2** (`nginxinc/nginx-unprivileged:1.27-alpine`): copies `dist/`
   into nginx, drops all caches, and runs as non-root UID `101` on port
   `8080`. Includes a `HEALTHCHECK` against `/healthz`.

Tag it with the **immutable commit SHA**, never `:latest`. Floating tags break
auditability and rollback.

### 4. Push to your internal registry

```bash
docker tag  trillium/myai-experimental:<git-sha> \
            registry.internal.trillium/myai-experimental:<git-sha>
docker push registry.internal.trillium/myai-experimental:<git-sha>
```

Use the company's internal Artifactory / GitLab Registry. Do **not** push to
public registries.

### 5. Run the container

#### Local smoke test

```bash
docker run --rm -p 8080:8080 \
  --read-only \
  --tmpfs /tmp \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  -e TZ=UTC \
  trillium/myai-experimental:<git-sha>
# Open http://localhost:8080
# Verify: curl -fsS http://localhost:8080/healthz   # → ok
```

#### Kubernetes (recommended)

Minimum hardened pod spec — adjust to your cluster's standards:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myai-experimental
spec:
  replicas: 2
  selector:
    matchLabels: { app: myai-experimental }
  template:
    metadata:
      labels: { app: myai-experimental }
    spec:
      automountServiceAccountToken: false
      securityContext:
        runAsNonRoot: true
        runAsUser: 101
        seccompProfile: { type: RuntimeDefault }
      containers:
        - name: web
          image: registry.internal.trillium/myai-experimental:<git-sha>
          imagePullPolicy: IfNotPresent
          ports:
            - { name: http, containerPort: 8080 }
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities: { drop: ['ALL'] }
          resources:
            requests: { cpu: 50m, memory: 64Mi }
            limits: { cpu: 250m, memory: 128Mi }
          readinessProbe:
            httpGet: { path: /healthz, port: http }
            initialDelaySeconds: 2
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /healthz, port: http }
            initialDelaySeconds: 10
            periodSeconds: 15
          volumeMounts:
            - { name: tmp, mountPath: /tmp }
            - { name: nginx-cache, mountPath: /var/cache/nginx }
      volumes:
        - { name: tmp, emptyDir: {} }
        - { name: nginx-cache, emptyDir: {} }
```

### 6. Front it with an HTTPS edge

The container speaks plain HTTP on `8080`. **TLS must be terminated upstream**
(ingress controller, cloud load balancer, CDN). The edge is responsible for:

- Forcing HTTPS (HTTP → HTTPS 301 redirect).
- Setting and propagating `X-Forwarded-Proto`, `X-Forwarded-For`,
  `X-Forwarded-Host` so logs are accurate.
- Modern TLS only (TLS 1.2+, prefer 1.3) with a vetted certificate.

The `Strict-Transport-Security` header is already set by the app's nginx but
only takes effect when the response is delivered over HTTPS at the edge.

### 7. Tighten the Content-Security-Policy

Open [`nginx/default.conf`](./nginx/default.conf) and update the
`connect-src` directive to list your real backend host(s):

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://api.your-domain.example; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" always;
```

Rebuild the image after editing.

### 8. Post-deploy verification

Run these against the public URL:

```bash
# 1. Health endpoint
curl -fsS https://app.your-domain.example/healthz                       # → ok

# 2. SPA loads
curl -fsSI https://app.your-domain.example/ | head -n1                  # → HTTP/2 200

# 3. Security headers present
curl -fsSI https://app.your-domain.example/ | grep -iE \
  'strict-transport-security|content-security-policy|x-frame-options|x-content-type-options|referrer-policy'

# 4. Source maps NOT exposed
curl -fsSI https://app.your-domain.example/assets/index.js.map          # → 403

# 5. Dotfiles NOT exposed
curl -fsSI https://app.your-domain.example/.env                         # → 403

# 6. Version surfaced in the UI matches the deployed commit SHA
```

If any of these fail, **roll back immediately** (re-deploy the previous
SHA-tagged image) and open an incident.

### 9. Rollback

Because every deploy is tagged by commit SHA, rollback is a one-liner:

```bash
kubectl set image deployment/myai-experimental \
  web=registry.internal.trillium/myai-experimental:<previous-git-sha>
```

---

## Hardening already applied

- **Security headers** in nginx: HSTS, `X-Content-Type-Options`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy`, `Cross-Origin-*` and a strict **CSP** without
  `unsafe-eval` or `unsafe-inline` for scripts.
- **No public source maps** (`*.map` denied) and dotfiles blocked.
- **Cache strategy**: `immutable` for one year on `/assets/*`
  (filename-hashed) and `no-store` on HTML to avoid serving stale entry
  points.
- **Non-root image**, no shell tooling needed at runtime, built-in
  `HEALTHCHECK`.
- **Reproducible builds**: dependencies pinned to exact versions and
  `npm ci` against the lockfile in CI and inside the Dockerfile.
- **Console / debugger stripped** from the production bundle by esbuild.
- **Hidden source maps** (generated but not referenced from the bundle), so
  they can be uploaded to Sentry/Datadog without exposing them publicly.

## Notes for extending

- **Routing**: add `react-router-dom` when the second view appears.
- **Remote state**: `@tanstack/react-query` for fetch + cache.
- **Telemetry**: hook `ErrorBoundary.componentDidCatch` into Sentry/Datadog.
- **Feature flags**: read in `src/config/env.ts` with a `VITE_FLAG_*` prefix.
- **Tests**: `vitest` + `@testing-library/react` once there is testable logic.
