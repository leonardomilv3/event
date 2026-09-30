# Arquitetura

## Stack

### Frontend

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 8 |
| Estilos | Tailwind CSS v3 |
| Roteamento | React Router v6 |
| Animações | Framer Motion 12 |
| Ícones | Material Symbols Outlined (Google Fonts) |
| Fontes | Inter (UI) + Playfair Display (editorial) |
| QR Code | qrcode.react 4.2 |

### Backend

| Camada | Tecnologia |
|---|---|
| Framework | Java 21 + Quarkus 3.12.3 |
| ORM | Hibernate ORM + Panache |
| Banco de dados | PostgreSQL 16.4 + PostGIS |
| Migrations | Flyway |
| Cache | Redis (Upstash TLS), TTL 5 min |
| Auth | SmallRye JWT (RSA RS256) |
| Scheduler | Quarkus Scheduler (`@Scheduled`) |
| Mailer | Quarkus Mailer (SMTP / mock em dev) |

### Infraestrutura (MVP)

| Serviço | Plataforma | Notas |
|---|---|---|
| Frontend | Vercel | Deploy automático via GitHub |
| Backend | Render | Container Docker; deploy via Actions |
| Banco de dados | Supabase | PostgreSQL + PostGIS managed |
| Cache | Upstash | Redis serverless TLS |
| CI/CD | GitHub Actions | Build + push Docker Hub + Render hook |

---

## Princípios

- **Mobile first** — classes base para mobile, `md:` e `lg:` para breakpoints maiores
- **Componentes reutilizáveis** — nenhuma lógica de apresentação duplicada entre páginas
- **Sem styled-components** — apenas Tailwind CSS e classes CSS globais em `index.css`
- **Fidelidade ao design** — todos os tokens do Stitch configurados em `tailwind.config.ts`
- **TypeScript estrito** — zero erros antes de qualquer avanço; sem uso de `any`

---

## Estrutura de diretórios

```
app/
├── index.html                  # Classe `dark` + Google Fonts no <head>
├── tailwind.config.ts          # Todos os tokens do design system
├── src/
│   ├── main.tsx                # Entry point — StrictMode + BrowserRouter
│   ├── App.tsx                 # Definição de rotas
│   ├── index.css               # @tailwind + glassmorphism + animações CSS
│   ├── components/
│   │   ├── atoms/              # Sem dependências internas ao projeto
│   │   ├── molecules/          # Compostos de átomos
│   │   └── organisms/          # Compostos de moléculas — seções completas
│   ├── pages/                  # Compostos de organismos — uma por rota
│   ├── hooks/                  # Custom hooks compartilhados
│   └── types/                  # Interfaces e tipos globais
└── public/                     # Assets estáticos
```

---

## Organização de componentes

A hierarquia segue Atomic Design com três níveis:

```
atoms      →  sem dependências internas; mapeiam diretamente tokens do design
molecules  →  compostos de 2–4 átomos; encapsulam um padrão de UI recorrente
organisms  →  seções completas; podem conter estado local e lógica de interação
pages      →  montam organismos; não contêm lógica de UI própria
```

**Regra de dependência:** `pages → organisms → molecules → atoms`. Nenhum nível importa de um nível acima.

---

## Convenções de código

| Convenção | Regra |
|---|---|
| Nomes de arquivos | PascalCase para componentes (`Button.tsx`, `TopNavBar.tsx`) |
| Props | Interface explícita antes do componente |
| Classes Tailwind condicionais | Array + `.join(' ')` para legibilidade |
| Comentários | Apenas quando o *porquê* não é óbvio — nunca o *o quê* |
| Imports de tipo | `import { type Foo }` — obrigatório com `verbatimModuleSyntax` |
| Responsividade | Classe base = mobile; `md:` e `lg:` ampliam para telas maiores |
