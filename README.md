# Trillium · Onboarding (experimental)

Onboarding portal powered by Trillium's in-house AI (Maya). Built with
**React 18 + TypeScript + Vite + Tailwind v4 + React Router**, ready to run
in production behind an HTTPS edge.

The full backlog this app covers is in
[`OnboardingContext.md`](./OnboardingContext.md) (`OB-01` … `OB-08`).

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
│   ├── components/         # Layout, RoleSwitcher, ErrorBoundary, ui/*
│   ├── contexts/           # RoleContext + useRole hook
│   ├── hooks/              # useAsync (no react-query, plain async/useState)
│   ├── config/env.ts       # Typed reader for VITE_* variables
│   ├── types/domain.ts     # All domain models (Employee, Phase, Tool, …)
│   ├── mocks/              # Fixtures used while integrations are stubbed
│   ├── services/           # Stubbed clients for every external system
│   ├── views/              # Route-level components (Home, Maya, Team, …)
│   ├── styles/index.css    # Tailwind import, design tokens, global rules
│   ├── App.tsx             # Router (BrowserRouter + Routes + RequireRole)
│   └── main.tsx            # ReactDOM root + ErrorBoundary + RoleProvider
├── nginx/                  # Production runtime configuration
├── Dockerfile              # Hardened multi-stage build
├── vite.config.ts
├── OnboardingContext.md    # Source of truth for the OB-01..OB-08 backlog
└── tsconfig*.json
```

## Application surfaces

The header navigation is filtered by the active role (use the **Role**
selector in the top-right to switch between `employee`, `manager`, `admin`).

| Route         | Story | Roles                    | Purpose                                                                  |
| ------------- | ----- | ------------------------ | ------------------------------------------------------------------------ |
| `/`           | —     | employee, manager, admin | Role-aware home with shortcuts                                           |
| `/onboarding` | OB-01 | employee                 | Progress across the 4 phases (Discovery → Setup → Access → Integration)  |
| `/maya`       | OB-02 | employee                 | Conversational onboarding with Adaptive Cards (email/phone/ID validated) |
| `/history`    | OB-03 | employee                 | Plain-language timeline of what happened and why                         |
| `/team`       | OB-04 | manager, admin           | New-hire dashboard with filters and SLA alerts                           |
| `/tools`      | OB-05 | manager, admin           | Approve Jira / GitLab / Slack / etc. one-by-one or as a batch            |
| `/feedback`   | OB-07 | manager, admin           | Feedback inbox auto-classified by MYAI and routed to Teams               |
| `/canvas`     | OB-08 | admin                    | Project Canvas linkage (Zoho · Contract · SharePoint) with drift sync    |
| `/ecosystem`  | OB-06 | employee, manager, admin | Health of every external service + maintenance windows                   |

## Integration stubs

Every external system has a typed client under `src/services/*.ts` that
returns mock data with simulated latency. Each one carries a `TODO(...)`
that documents the real endpoint to wire later. Nothing in this repo talks
to a real third-party API yet.

| Service file           | Story         | Real backend (TODO)                                            |
| ---------------------- | ------------- | -------------------------------------------------------------- |
| `employeesService.ts`  | OB-01, OB-04  | `GET /employees`                                               |
| `progressService.ts`   | OB-01         | `GET /employees/{id}/onboarding/progress`                      |
| `myaiService.ts`       | OB-02, OB-07  | `POST /myai/chat` (SSE), `POST /myai/classify`                 |
| `historyService.ts`    | OB-03         | `GET /employees/{id}/history` (plain-language transformation)  |
| `toolsService.ts`      | OB-05         | `POST /employees/{id}/tools/approve-all` and friends           |
| `ecosystemService.ts`  | OB-06         | `GET /ecosystem/snapshot`, `WS /ecosystem/stream`              |
| `feedbackService.ts`   | OB-07         | `POST /feedback` → MYAI classify → Teams notify                |
| `teamsService.ts`      | OB-07         | `POST /integrations/teams/notify` (allowlisted channels only)  |
| `sharePointService.ts` | cross-cutting | `POST /sharepoint/sign` (1h signed URLs)                       |
| `canvasService.ts`     | OB-08         | `GET /canvas/{id}`, `POST /canvas/{id}/sync`, `POST /push`     |
| `hrisService.ts`       | cross-cutting | `GET /hris/{provider}/employees/{id}` (Deel + Gusto, redacted) |
| `zohoService.ts`       | cross-cutting | `GET /zoho/projects/{zohoProjectId}` (read-only from the BFF)  |
| `transport.ts`         | cross-cutting | `withCircuitBreaker` — keep when wiring real endpoints         |

### Security guardrails baked into the stubs

- **Circuit breaker.** `withCircuitBreaker` short-circuits any service after
  5 consecutive failures (30 s cooldown), satisfying the
  "Containment of Loops" requirement from `OnboardingContext.md`.
- **Zero-chat monitoring.** Maya only sends what the user explicitly typed.
  No focus / clipboard / passive signals.
- **Teams allowlist.** `notifyTeams` rejects any channel not on the
  in-code allowlist.
- **Signed URLs.** `sharePointService.getSignedUrl` returns
  `expiresAt = now + 1h`, matching the spec's TTL.
- **No tokens in the browser.** Every comment in the services makes the
  same point: third-party tokens (Zoho, Deel, Gusto, GitLab, Slack, Teams,
  SharePoint) live in the BFF, never in this bundle.
- **Anti-duplication.** `canvasService` writes are idempotent on
  `employeeId` to prevent the duplicate entries flagged in OB-08.

## Styling

Styling is handled with **Tailwind CSS v4** through the official Vite plugin
(`@tailwindcss/vite`). There is **no `tailwind.config.js`** — in v4 everything
that used to live there is now expressed in CSS.

### Where styles live

| File / location                                  | What goes here                                                                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/styles/index.css`](./src/styles/index.css) | The single source of truth: Tailwind import, design tokens (`@theme`), and global rules for `body`, `#root`, etc. Imported once from `src/main.tsx`.    |
| `src/components/*.tsx`, `src/views/*.tsx`        | All component-level styling, written **inline as Tailwind utility classes** (`className="flex items-center …"`). Do not create per-component CSS files. |
| [`vite.config.ts`](./vite.config.ts)             | Wires the `tailwindcss()` plugin into the build pipeline.                                                                                               |

### How it works

`src/styles/index.css` looks like this:

```css
@import 'tailwindcss';

@theme {
  --color-bg: #0b1020;
  --color-surface: #131a30;
  --color-accent: #6366f1;
  /* … */
}

body {
  margin: 0;
}

#root {
  /* layout / background / typography for the whole app shell */
}
```

- `@import 'tailwindcss';` pulls in Tailwind's preflight + utilities.
- The `@theme { … }` block declares **design tokens**. Any `--color-*`
  declared here is automatically available as a Tailwind utility — for
  example `--color-accent: #6366f1` enables `bg-accent`, `text-accent`,
  `border-accent`, etc. Same pattern for spacing, radius, font, etc.
- The plain CSS rules below (`body`, `#root`, `:root`) are intentionally
  scoped to the app shell — they handle the full-viewport layout and
  background gradient that no utility could express cleanly. Avoid adding
  more global rules; prefer utilities on the elements themselves.

### How to use it

1. **Style components with utility classes**, never with new CSS files:

   ```tsx
   <button className="rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 px-5 py-2 font-semibold text-white hover:-translate-y-0.5">
     Click me
   </button>
   ```

2. **Add a new design token** by extending `@theme` in
   `src/styles/index.css`:

   ```css
   @theme {
     --color-warning: #f59e0b;
     --radius-pill: 999px;
   }
   ```

   Now `bg-warning`, `text-warning`, `rounded-pill` work everywhere.

3. **Override a token** by redeclaring it inside `@theme` — the rest of the
   app picks it up automatically since utilities resolve to CSS variables at
   build time.

4. **Need a one-off utility that Tailwind doesn't have?** Use Tailwind's
   arbitrary-value syntax (`px-[clamp(1rem,4vw,2.5rem)]`,
   `grid-cols-[repeat(auto-fit,minmax(180px,1fr))]`) before reaching for raw
   CSS. Genuine cross-cutting rules can go in `src/styles/index.css`, but
   keep that file small.

5. **Reference**: official docs at
   <https://tailwindcss.com/docs> (Tailwind v4 syntax). The `@theme`
   directive is documented under
   <https://tailwindcss.com/docs/theme>.

### What not to do

- Don't create `*.module.css` or `*.css` files alongside components — they
  bypass Tailwind's purge and grow the bundle.
- Don't add Tailwind classes to global `index.css`. The `@apply` directive
  is intentionally avoided here; utilities belong on the JSX.
- Don't put theme values (colors, radii, spacing) directly in component
  classes as hex codes or pixel values. Add them as tokens in `@theme` so
  the design stays consistent.

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

- **New view**: add a component under `src/views/`, then register a `<Route>`
  in [`src/App.tsx`](./src/App.tsx) (wrap with `<RequireRole allow={[…]}>`
  if it should be role-gated) and add a `NavLink` in
  [`src/components/Layout.tsx`](./src/components/Layout.tsx) with the same
  `roles` array.
- **Wiring a real backend**: open the relevant `src/services/*.ts`, replace
  the mock with a real `fetch` call to `config.apiBaseUrl`, keep the
  `withCircuitBreaker` wrapper, drop the matching `TODO(...)` comment.
  All views consume services through stable function signatures, so the
  swap is local to one file.
- **Remote state**: `@tanstack/react-query` is the path forward when
  manual `useAsync` becomes painful (caching, deduping, refetch on focus).
- **Telemetry**: hook `ErrorBoundary.componentDidCatch` into Sentry/Datadog.
- **Feature flags**: read in `src/config/env.ts` with a `VITE_FLAG_*` prefix.
- **Tests**: `vitest` + `@testing-library/react` once there is testable
  logic. The services are pure functions over fixtures and are the easiest
  thing to start covering.
