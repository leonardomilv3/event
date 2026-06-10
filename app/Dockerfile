# ─────────────────────────────────────────────
# Stage 1 — Build
# ─────────────────────────────────────────────
FROM node:lts-alpine AS builder

WORKDIR /app

# VITE_ vars são injetados em tempo de build (não de runtime).
# Passe-os via --build-arg ao construir a imagem.
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

# Instalar dependências com lockfile travado (determinístico)
COPY package.json package-lock.json ./
RUN npm ci

# Copiar fonte e executar build de produção
COPY . .
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2 — Runtime
# ─────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Configuração nginx customizada (SPA routing, gzip, security headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Artefatos estáticos gerados pelo Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
