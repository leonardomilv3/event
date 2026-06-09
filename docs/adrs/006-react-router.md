# ADR-006: React Router v6 para Roteamento

## Status

Accepted

## Context

O Eventing tem 4 rotas distintas (`/`, `/dashboard`, `/events`, `/events/:id`) com navegação client-side. A escolha do roteador afeta como links ativos são detectados, como parâmetros de rota são acessados e como a navegação é integrada aos componentes de navegação (`TopNavBar`, `SideNavBar`, `BottomNav`).

## Decision

Usar **React Router v6** para roteamento client-side, configurado com `BrowserRouter` no `main.tsx` e rotas declaradas em `App.tsx`.

Componentes de navegação usam `useLocation()` para detectar a rota ativa e aplicar estilos. Links de navegação usam o componente `<Link>` do React Router em vez de `<a>` para evitar reload de página.

Rota catch-all (`path="*"`) redireciona para `/` via `<Navigate replace />`.

## Consequences

**Positivas:**
- `useLocation()` disponível em qualquer componente filho do `BrowserRouter` — simplifica a detecção de rota ativa nos navbars
- `<Link>` previne reload e preserva o estado da SPA
- API declarativa e familiar — curva de aprendizado mínima
- Suporte nativo a parâmetros dinâmicos (`/events/:id`) via `useParams()`

**Negativas:**
- Sem loaders de dados integrados (disponível no React Router v6.4+ com `createBrowserRouter`) — não necessário enquanto os dados são mockados
- Histórico de breaking changes entre versões (v5 → v6) — cuidado ao atualizar

## Alternatives Considered

- **TanStack Router** — type-safe params e loaders integrados, mas overhead de configuração para 4 rotas simples; adotar quando houver API real com fetch de dados por rota
- **Next.js App Router** — file-based routing poderoso, mas mudaria toda a arquitetura para SSR/RSC; descartado (ver ADR-002)
- **Wouter** — alternativa minimalista (~2KB), mas ecossistema menor e sem `useLocation` integrado
