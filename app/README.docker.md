# Eventing Frontend — Docker

Guia de build, execução local e deploy no Azure Container Apps.

---

## Visão geral

O frontend é uma SPA React/Vite servida por **nginx:alpine**.
O processo usa dois estágios Docker:

| Stage | Imagem base | Função |
|---|---|---|
| `builder` | `node:lts-alpine` | Instala dependências e executa `npm run build` |
| `runtime` | `nginx:alpine` | Serve os arquivos estáticos do `dist/` |

Tamanho estimado da imagem final: **~25–30 MB** (apenas nginx + dist).

---

## Variáveis de ambiente

> **Atenção:** variáveis `VITE_*` são injetadas **em tempo de build**, não de execução.
> O Vite as incorpora diretamente no bundle JS. O container nginx não as lê em runtime.

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_URL` | URL base do backend Quarkus | `http://localhost:8080` |

Para configurar, copie `.env.example` e ajuste:

```bash
cp app/.env.example app/.env.local   # desenvolvimento local (Vite lê automaticamente)
```

Para Docker, passe via `--build-arg` (ver seções abaixo).

---

## Desenvolvimento local (sem Docker)

```bash
cd app
npm install
npm run dev        # http://localhost:5173
```

---

## Build e execução com Docker

### Build da imagem

```bash
# Com VITE_API_URL padrão (localhost:8080)
docker build -t eventing-frontend ./app

# Com URL de staging
docker build \
  --build-arg VITE_API_URL=https://api.staging.eventing.com.br \
  -t eventing-frontend:staging \
  ./app

# Com URL de produção
docker build \
  --build-arg VITE_API_URL=https://api.eventing.com.br \
  -t eventing-frontend:latest \
  ./app
```

### Executar localmente

```bash
docker run --rm -p 3000:80 eventing-frontend
```

Acesse: [http://localhost:3000](http://localhost:3000)

As rotas do React Router (`/events`, `/events/123`, `/dashboard`) funcionam após refresh
graças à configuração `try_files $uri $uri/ /index.html` no nginx.

### Docker Compose (raiz do projeto)

```bash
# Subir o frontend
docker compose up --build

# Em background
docker compose up --build -d

# Parar
docker compose down
```

Acesse: [http://localhost:3000](http://localhost:3000)

Para mudar a `VITE_API_URL` via Compose:

```bash
VITE_API_URL=https://api.staging.eventing.com.br docker compose up --build
```

---

## Deploy no Azure Container Apps

### 1. Autenticar no Azure e criar o registry (uma vez)

```bash
az login
az acr create --name eventingregistry --resource-group eventing-rg --sku Basic
az acr login --name eventingregistry
```

### 2. Build com tag para o registry

```bash
docker build \
  --build-arg VITE_API_URL=https://api.eventing.com.br \
  -t eventingregistry.azurecr.io/eventing-frontend:latest \
  ./app
```

### 3. Push para o Azure Container Registry

```bash
docker push eventingregistry.azurecr.io/eventing-frontend:latest
```

### 4. Criar o Container App (primeira vez)

```bash
az containerapp create \
  --name eventing-frontend \
  --resource-group eventing-rg \
  --environment eventing-env \
  --image eventingregistry.azurecr.io/eventing-frontend:latest \
  --registry-server eventingregistry.azurecr.io \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3
```

### 5. Atualizar o Container App (deploys subsequentes)

```bash
az containerapp update \
  --name eventing-frontend \
  --resource-group eventing-rg \
  --image eventingregistry.azurecr.io/eventing-frontend:latest
```

---

## Arquitetura alvo (MVP)

```
Internet
  → Azure Front Door (CDN + WAF)
  → Frontend React Container App (porta 80, esta imagem)
  → Backend Quarkus Container App (VITE_API_URL)
```

---

## Melhorias futuras

| Melhoria | Contexto |
|---|---|
| Health check endpoint no nginx | Azure Container Apps usa `/` por padrão; um `/health` dedicado é mais limpo |
| Config runtime via `window.__ENV__` | Permite trocar `VITE_API_URL` sem rebuild via script injetado pelo nginx no `index.html` |
| Cabeçalho `Content-Security-Policy` | Adicionar após mapear todos os domínios externos (Google Fonts, CDN de imagens) |
| Build multi-arch (`--platform linux/amd64,linux/arm64`) | Para suporte a Apple Silicon em CI sem emulação |
| CI/CD via GitHub Actions | Trigger no push para `main` → build → push ACR → deploy Container App |
