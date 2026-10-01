# ADR-011: Vercel Routing Middleware para Open Graph e SEO por evento

## Status

Accepted

## Context

O frontend é uma SPA Vite servida estaticamente pela Vercel. Toda página entrega o mesmo `index.html`, com um `<title>` genérico; o conteúdo do evento só existe depois que o JavaScript roda e chama a API.

Crawlers de preview social (WhatsApp, Facebook, X, Telegram, Slack, LinkedIn, Discord) e ferramentas como `curl` **não executam JavaScript**. O resultado: todo link de evento compartilhado virava um card genérico do site, e buscadores não tinham título/descrição por evento. Isso quebra o loop viral (links pouco atraentes) e a indexação orgânica ("eventos em [cidade] [categoria]").

Bibliotecas como `react-helmet` não resolvem, porque alteram o `<head>` só no cliente.

## Decision

`app/middleware.ts` (Vercel Routing Middleware, convenção de arquivo na raiz do projeto Vercel, runtime Node.js) intercepta:

- **`/events/:id`**: se o user-agent é de crawler/preview (`facebookexternalhit`, `Twitterbot`, `WhatsApp`, `TelegramBot`, `Slackbot`, `LinkedInBot`, `Discordbot`, `Googlebot`, `bingbot`, `curl`, `wget`… ver `BOT_UA_RE`), busca `GET {API_URL}/api/events/{id}` server-side e devolve o próprio `index.html` com o `<title>` substituído por:
  - `<title>{title} — {locationName} — Eventing</title>` e `<meta name="description">`
  - `og:title`, `og:description` (data + local + início da descrição, ~150 chars), `og:image` (capa ou fallback), `og:url` canônica, `og:type=website`
  - `twitter:card=summary_large_image` e espelhos `twitter:*`
  - `<link rel="canonical">` e JSON-LD `schema.org/Event`
- **`/sitemap.xml`**: proxy para `GET {API_URL}/sitemap.xml` (Quarkus, `com.eventing.seo`, cache Redis TTL 1h). Assim o sitemap fica no domínio do site.

Regras operacionais:
- Só eventos `PUBLISHED` + `PUBLIC` recebem metadados. Os demais (privados, rascunho, inexistente, API fora do ar ou cold start acima de 8s) caem em `next()` e recebem a SPA normal, sem vazar dados.
- Usuários humanos **não passam pela API no middleware**: `next()` imediato, sem latência adicional.
- O HTML injetado continua sendo a SPA completa. Um crawler que executa JS (Googlebot) renderiza a página real, e um eventual cache compartilhado entre UAs não quebra humanos.
- O link compartilhado é a URL canônica `/events/:id?ref=share&via={canal}`. Não existe "URL de share" separada.
- `app/public/robots.txt` libera `/events/*`, bloqueia rotas autenticadas e aponta para o sitemap.

Variáveis de ambiente na Vercel: `API_URL` (fallback `VITE_API_URL`, depois `https://eventing-api.onrender.com`) e `SITE_URL` (fallback: origem da requisição).

## Consequences

**Positivas:**
- Cards ricos (imagem, título, data) em qualquer rede, sem SDK e sem mudar a URL compartilhada
- `curl https://.../events/{id}` retorna `<title>`/`<meta description>` específicos, atendendo o critério de SEO
- Mudança restrita a uma peça de infraestrutura no frontend; o backend ganha apenas o endpoint de sitemap

**Negativas:**
- Cold start do Render free tier pode passar do timeout de 8s; nesse caso o crawler recebe o card genérico (o WhatsApp mantém o preview em cache, então o primeiro compartilhamento após inatividade pode sair pobre)
- Lista de user-agents precisa de manutenção quando surgirem novos crawlers
- Middleware fica fora do bundle Vite. É type-checked via `tsconfig.node.json`, mas não roda em `npm run dev`; testar com `vercel dev` ou em preview deploy

## Alternatives Considered

- **Rota `GET /share/events/{id}` no Quarkus com meta refresh**: o link compartilhado ficaria no domínio do Render (`eventing-api.onrender.com`), sujeito a cold start em toda abertura, e não resolveria SEO na URL canônica `/events/:id`
- **SSR/framework (Next.js, Remix)**: reescrita desproporcional ao problema e contrária ao ADR-002
- **Pré-renderização no build (SSG)**: eventos são criados em runtime, então não há lista estática no momento do build
- **`react-helmet`**: só altera o DOM no cliente; invisível para crawlers sem JS
