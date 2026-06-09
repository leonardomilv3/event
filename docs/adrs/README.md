# Architecture Decision Records

Registro de decisões arquiteturais do projeto Eventing.

## Formato

Cada ADR segue a estrutura: **Status → Context → Decision → Consequences → Alternatives Considered**.

## ADRs

| ADR | Título | Status |
|---|---|---|
| [001](./001-react-typescript.md) | React com TypeScript | Accepted |
| [002](./002-vite.md) | Vite como Build Tool | Accepted |
| [003](./003-tailwind-css.md) | Tailwind CSS v3 | Accepted |
| [004](./004-mobile-first.md) | Abordagem Mobile First | Accepted |
| [005](./005-atomic-design.md) | Atomic Design como Hierarquia de Componentes | Accepted |
| [006](./006-react-router.md) | React Router v6 para Roteamento | Accepted |
| [007](./007-framer-motion.md) | Framer Motion para Micro-interações | Accepted |
| [008](./008-no-styled-components.md) | Proibição de styled-components | Accepted |
| [009](./009-design-system-tokens.md) | Design System Tokens do Stitch como Fonte Única de Verdade | Accepted |
| [010](./010-typescript-strict.md) | TypeScript Estrito com verbatimModuleSyntax | Accepted |

## Como criar um novo ADR

1. Criar `NNN-titulo-kebab-case.md` nesta pasta
2. Usar o template abaixo
3. Adicionar a entrada na tabela acima

```markdown
# ADR-NNN: Título

## Status

Proposed | Accepted | Deprecated | Superseded by ADR-XXX

## Context

O problema que motivou a decisão.

## Decision

A decisão tomada e como ela é aplicada no projeto.

## Consequences

**Positivas:**
- ...

**Negativas:**
- ...

## Alternatives Considered

- **Alternativa A** — por que foi descartada
- **Alternativa B** — por que foi descartada
```
