# ADR-003: Tailwind CSS v3

## Status

Accepted

## Context

O projeto tem um design system complexo com 50+ tokens de cor (paleta Material Design 3), 9 escalas tipográficas, espaçamento semântico baseado em 8px, border radius customizado e sombras com glow. Todos esses tokens foram exportados pelo Stitch em formato compatível com Tailwind. A escolha do sistema de estilos precisa suportar fidelidade ao design, responsividade mobile first e ausência de styled-components (regra explícita do projeto).

## Decision

Usar **Tailwind CSS v3** com todos os tokens do design system configurados em `app/tailwind.config.ts` via `theme.extend`.

A versão 3 (não v4) é usada porque o design system exportado pelo Stitch usa a API `tailwind.config.ts` com `theme.extend` — estrutura que foi radicalmente alterada na v4. Migrar para v4 exigiria reescrever todos os tokens sem benefício funcional imediato.

Os tokens são adicionados via `theme.extend` (não `theme`) para preservar os utilitários padrão do Tailwind (`white`, `black`, `transparent`, escalas de opacidade).

Animações de marca (`pulse-ring`, `breath`, `pulse-red`) são declaradas em `tailwind.config.ts` como `keyframes` e `animation` customizados, gerando as classes `animate-*` correspondentes.

## Consequences

**Positivas:**
- Todos os 50+ tokens do design system acessíveis como classes utilitárias (`bg-primary-container`, `text-on-surface-variant`, `shadow-mint-glow`)
- Responsividade mobile first com prefixos `md:` e `lg:` aplicados diretamente nas classes
- Tree-shaking automático — apenas classes usadas são incluídas no build
- Nomes de tokens com hífens (ex: `surface-container-low`) funcionam diretamente como classes sem configuração adicional
- CSS global mínimo: apenas glassmorphism, gradientes e animações com `::after` que não suportam classes inline

**Negativas:**
- Classes longas em componentes com muitas condicionais (mitigado com array + `.join(' ')`)
- IntelliSense depende de extensão de editor (Tailwind CSS IntelliSense para VS Code)
- Versão travada na v3 até decisão explícita de migração para v4

## Alternatives Considered

- **Tailwind CSS v4** — API incompatível com os tokens exportados pelo Stitch; descartado até estabilização
- **CSS Modules** — sem suporte a design tokens compartilhados sem variáveis CSS adicionais; mais verboso
- **styled-components** — explicitamente proibido pelas regras do projeto (`CLAUDE.md`)
- **Vanilla CSS com custom properties** — viável, mas exigiria configurar manualmente todo o sistema de tokens que o Tailwind já gera automaticamente
