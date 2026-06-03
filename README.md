# Eventing — Living City Interface

Plataforma para descobrir, criar e participar de eventos locais. Interface "Living City" — dark mode editorial com identidade noturna e vibrante.

## Pré-requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
cd app
npm install
```

## Rodando localmente

```bash
cd app
npm run dev
```

Acesse **http://localhost:5173** no browser.

> Para rodar em outra porta: `npm run dev -- --port 3000`

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção (TypeScript + Vite) |
| `npm run preview` | Pré-visualizar o build de produção localmente |
| `npm run lint` | Verificar erros de lint (ESLint) |

## Páginas

| Rota | Descrição |
|---|---|
| `/` | Landing Page — hero, carousel de eventos, mapa, "como funciona" |
| `/dashboard` | User Dashboard — perfil, stats, timeline de atividade |
| `/events` | Event Management — grid de cards com filtros por status |
| `/events/:id` | Event Detail — hero cinematográfico, agenda, venue, CTA persistente |

## Stack

- **React 18** + TypeScript
- **Vite** — build tool
- **Tailwind CSS v3** — tokens do design system em `tailwind.config.ts`
- **React Router v6** — roteamento client-side
- **Framer Motion** — micro-interações
- **Material Symbols Outlined** — ícones (Google Fonts)
- **Inter** + **Playfair Display** — tipografia (Google Fonts)

## Estrutura do projeto

```
app/
├── src/
│   ├── components/
│   │   ├── atoms/       # Button, Icon, TagChip, ActivityPulse, ProgressBar
│   │   ├── molecules/   # EventCard, StatCard, GlassPanel, FilterTabs, ...
│   │   └── organisms/   # TopNavBar, SideNavBar, BottomNav, FAB, Footer, ...
│   ├── pages/           # LandingPage, UserDashboard, EventManagement, EventDetail
│   └── index.css        # Tailwind directives + glassmorphism + animações CSS
├── tailwind.config.ts   # Tokens completos do design system (cores, tipografia, espaçamento)
└── index.html           # Classe `dark` + Google Fonts
```

O design system completo está documentado em [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).
