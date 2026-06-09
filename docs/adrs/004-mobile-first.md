# ADR-004: Abordagem Mobile First

## Status

Accepted

## Context

O Eventing é uma plataforma de descoberta de eventos urbanos — o caso de uso primário é alguém consultando o app na rua, em movimento, no celular. O design exportado pelo Stitch define breakpoints explícitos para mobile (< 768px), tablet (768–1023px) e desktop (≥ 1024px), com layouts radicalmente diferentes em cada um: navegação muda de TopNavBar para BottomNav, sidebar some, grids colapsam. A ordem em que as classes são escritas afeta a especificidade e a legibilidade do código.

## Decision

Adotar **mobile first** como estratégia de responsividade: classes sem prefixo definem o comportamento mobile, prefixos `md:` e `lg:` sobrescrevem para telas maiores.

Isso é aplicado consistentemente em:
- **Tipografia:** `text-headline-lg-mobile` como base, `md:text-headline-lg` para desktop
- **Layout:** `grid-cols-1` como base, `md:grid-cols-2 lg:grid-cols-3` para telas maiores
- **Navegação:** `BottomNav` visível por padrão (`md:hidden`), `SideNavBar` oculta por padrão (`hidden md:flex`)
- **Espaçamento:** `px-margin-mobile` como base, `md:px-margin-desktop` para desktop
- **FAB:** presente em todas as telas; versão mobile-only usa `md:hidden`

## Consequences

**Positivas:**
- CSS gerado é menor — estilos base (mobile) são herdados; apenas overrides são adicionados
- Força pensar no layout mais restrito primeiro, evitando features impossíveis de adaptar para mobile
- Alinhado com a diretriz do projeto (`CLAUDE.md`: "Mobile first")
- Breakpoints do Tailwind (`md:`, `lg:`) são min-width — compatíveis com mobile first por design

**Negativas:**
- Componentes com layouts muito diferentes entre mobile e desktop podem ter classes longas
- Requer disciplina consistente — uma classe desktop sem prefixo quebra a hierarquia silenciosamente

## Alternatives Considered

- **Desktop first** — classes sem prefixo para desktop, `max-md:` para mobile. Contrário às regras do projeto e à direção dos breakpoints do Tailwind (min-width)
- **Layouts completamente separados por breakpoint** — componentes duplicados para mobile e desktop. Mais código, menos manutenível
