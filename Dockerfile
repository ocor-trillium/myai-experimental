# syntax=docker/dockerfile:1.7

# =============================================================================
# Etapa 1: build con Node Alpine
# Pinned by major+minor; en CI sustituir por digest @sha256:... cuando se
# publique a un registry interno (cumple regla 13-infrastructure).
# =============================================================================
FROM node:20.18.2-alpine AS build

WORKDIR /app

ENV NODE_ENV=production \
    CI=true \
    npm_config_loglevel=warn

# Instala dependencias de forma reproducible desde el lockfile.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --ignore-scripts

# Copia el código y construye.
COPY . .
RUN npm run build


# =============================================================================
# Etapa 2: runtime con nginx unprivileged
# La imagen `nginxinc/nginx-unprivileged` ya corre como UID 101 sin root
# y escucha en 8080, lo que la hace compatible con Kubernetes
# `runAsNonRoot: true` y `readOnlyRootFilesystem: true`.
# =============================================================================
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

USER root
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Directorios escribibles necesarios cuando se monta rootfs read-only.
RUN mkdir -p /var/cache/nginx /var/run \
 && chown -R 101:101 /usr/share/nginx/html /var/cache/nginx /var/run

USER 101

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
