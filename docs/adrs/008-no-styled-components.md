# ADR-008: Proibição de styled-components

## Status

Accepted

## Context

O projeto define explicitamente em `CLAUDE.md`: "Não usar styled-components". Esta regra existe em um contexto onde o design system é implementado via Tailwind CSS com tokens configurados em `tailwind.config.ts`. Misturar styled-components com Tailwind criaria dois sistemas paralelos de estilização com sobreposição de responsabilidades e duplicação de tokens.

## Decision

**Não usar styled-components** nem qualquer biblioteca de CSS-in-JS (emotion, stitches, vanilla-extract, etc.) no projeto.

Todo estilo é implementado exclusivamente via:
1. **Classes Tailwind** — utilitários e tokens do design system
2. **`index.css` com `@layer`** — glassmorphism, gradientes e animações com `::after` que não suportam classes inline
3. **`style` prop** — apenas para valores verdadeiramente dinâmicos que não podem ser expressados com classes (ex: `fontVariationSettings` no componente `Icon`, posicionamento inline de `ActivityPulse`)

## Consequences

**Positivas:**
- Um único sistema de estilização — nenhuma dúvida sobre onde uma regra CSS vive
- Tokens do design system em `tailwind.config.ts` são a fonte única de verdade para cores, tipografia e espaçamento
- Build mais simples: sem runtime CSS-in-JS, sem injeção de estilos no `<head>` em produção
- Tailwind tree-shaking elimina classes não usadas — CSS final mínimo

**Negativas:**
- Estilos dinâmicos complexos (ex: cor variável por prop) exigem mapeamento de classes em vez de interpolação direta
- Sem encapsulamento de escopo por componente — classes globais podem colidir (mitigado pelo uso de `@layer` e naming do design system)

## Alternatives Considered

- **styled-components** — proibido explicitamente pelas regras do projeto
- **CSS Modules** — escopo por arquivo, mas sem integração com os tokens do Tailwind; descartado em favor de consistência com o design system
- **Inline styles** — usado apenas para valores genuinamente dinâmicos (`style` prop); não como estratégia principal
