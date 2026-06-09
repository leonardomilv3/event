# Eventing — Implementation Plan

Índice da documentação técnica do projeto.
Baseado no design exportado pelo Stitch em `stitch_eventing_living_city_interface/`.

---

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | Stack, estrutura de diretórios, princípios, organização de componentes, convenções de código |
| [`docs/design-system.md`](docs/design-system.md) | Cores, glassmorphism, glows, gradientes, tipografia, espaçamento, radius, animações, grid |
| [`docs/routes.md`](docs/routes.md) | Todas as rotas, layouts de navegação, seções de cada página |
| [`docs/components.md`](docs/components.md) | Átomos, moléculas e organismos — props, responsabilidades e notas de uso |
| [`docs/development-workflow.md`](docs/development-workflow.md) | Instalação, scripts, build, validações, checklist pré-merge, histórico de fases |
| [`docs/decisions.md`](docs/decisions.md) | Decisões arquiteturais explícitas e implícitas — stack, CSS, tokens, componentes |
| [`docs/adrs/`](docs/adrs/) | ADRs formais para decisões futuras de maior impacto |

---

## Status

Todas as fases concluídas. Build de produção limpo — zero erros TypeScript.

| Fase | Descrição | Status |
|---|---|---|
| 1 | Setup: Vite + React + TS + Tailwind + Router + tokens | ✅ |
| 2 | Átomos + Moléculas | ✅ |
| 3 | Organismos de navegação | ✅ |
| 4 | Páginas: EventManagement, LandingPage, UserDashboard, EventDetail | ✅ |
| 5 | Micro-interações: parallax, scroll behavior, drag carousel, FAB tooltip | ✅ |
