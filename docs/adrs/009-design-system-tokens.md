# ADR-009: Design System Tokens do Stitch como Fonte Única de Verdade

## Status

Accepted

## Context

O design visual do Eventing foi criado no Stitch e exportado para `stitch_eventing_living_city_interface/`. O export inclui o tema "Living City Aura" com 50+ tokens de cor (paleta Material Design 3), 9 escalas tipográficas, sistema de espaçamento baseado em 8px, border radius e animações definidas em `DESIGN.md`. Sem uma estratégia clara para consumir esses tokens, cores e tamanhos seriam hardcoded no código (`#7be7b4`, `20px`) criando divergência entre design e implementação.

## Decision

Configurar **todos os tokens do Stitch como classes Tailwind** em `app/tailwind.config.ts` via `theme.extend`. Nenhuma cor, tamanho ou sombra do design system deve ser hardcoded no código de componentes — sempre usar a classe Tailwind correspondente.

Hierarquia dos tokens:

- **Cores** — `theme.extend.colors`: `primary-container`, `on-surface`, `surface-container`, etc.
- **Tipografia** — `theme.extend.fontFamily` + `theme.extend.fontSize`: `font-serif`, `text-headline-md`, etc.
- **Espaçamento** — `theme.extend.spacing`: `stack-xs`, `stack-xl`, `margin-desktop`, etc.
- **Sombras** — `theme.extend.boxShadow`: `shadow-mint-glow`, `shadow-mint-glow-strong`, etc.
- **Animações** — `theme.extend.keyframes` + `theme.extend.animation`: `animate-pulse-ring`, etc.

**Exceção permitida:** `style` prop para valores impossíveis de expressar como classe Tailwind (ex: `fontVariationSettings` no `Icon`, posições absolutas calculadas dinamicamente no `ActivityPulse`).

A distinção `primary` vs `primary-container` do Material Design 3 é preservada fielmente:
- `primary` (`#b3ffd7`) — texto e ícones em destaque
- `primary-container` (`#7be7b4`) — botões, bordas ativas, glows

## Consequences

**Positivas:**
- Mudança de cor no design → atualiza `tailwind.config.ts` → propaga para todos os componentes automaticamente
- IntelliSense sugere os tokens corretos ao digitar `bg-` ou `text-`
- Auditoria de uso de tokens via busca por string (`bg-primary-container`) encontra todos os usos
- Nenhuma divergência entre o que o designer especificou e o que está no código

**Negativas:**
- `tailwind.config.ts` extenso (~100 linhas de tokens) — necessário, não simplificável
- Tokens com nomes longos (`text-on-surface-variant`, `bg-surface-container-lowest`) produzem classes longas em componentes
- Lock-in no Stitch como ferramenta de design — mudança de ferramenta exige remapear todos os tokens

## Alternatives Considered

- **CSS custom properties (`var(--color-primary)`)** — portável entre frameworks, mas sem IntelliSense de Tailwind e sem tree-shaking de tokens não usados
- **Hardcode de valores** (`#7be7b4`, `20px`) — rápido de escrever, impossível de manter; qualquer mudança de cor exige busca e substituição global
- **Arquivo de constantes TypeScript** — tipagem forte, mas sem integração com classes Tailwind
