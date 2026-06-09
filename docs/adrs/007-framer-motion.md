# ADR-007: Framer Motion para Micro-interações

## Status

Accepted

## Context

O design "Living City" exige micro-interações que vão além do que CSS transitions conseguem expressar com elegância em React: parallax do hero reagindo ao movimento do mouse, animações de entrada de componentes, e potencialmente animações de page transition no futuro. As animações de identidade da marca (Activity Pulse, badges Live) são implementadas em CSS puro — Framer Motion é reservado para interações orientadas a eventos JavaScript.

## Decision

Usar **Framer Motion** para micro-interações baseadas em eventos JavaScript que não podem ser expressas com CSS puro.

No projeto atual, o uso é focado em:
- **Parallax do hero** na `LandingPage` — translação suave do `hero-gradient` em resposta ao `mousemove` via `useEffect` com transform inline
- Preparação para animações de entrada (`motion.div` com `initial`/`animate`) em fases futuras

Animações de marca (pulse dots, breath) permanecem em CSS puro — ver ADR-013.

## Consequences

**Positivas:**
- API declarativa para animações complexas (`useSpring`, `useMotionValue`) sem manipulação manual de `requestAnimationFrame`
- Cleanup automático de listeners quando componentes desmontam (evita vazamentos)
- Layout animations e shared element transitions disponíveis para fases futuras
- Integra com `useReducedMotion()` para acessibilidade

**Negativas:**
- ~45KB adicionados ao bundle (mitigado pelo tree-shaking de módulos não utilizados)
- Parallax atual poderia ser implementado com `useEffect` + transform inline sem Framer Motion — a dependência está parcialmente subutilizada no estado atual do projeto

## Alternatives Considered

- **CSS transitions / animations puras** — suficientes para hovers e estados, mas inadequadas para parallax com física (spring) e animações coordenadas entre componentes
- **React Spring** — API similar, bundle comparável; Framer Motion tem documentação superior e integração com o ecossistema React mais consolidada
- **GSAP** — mais poderoso para animações complexas de timeline, mas licença comercial para uso em SaaS e bundle maior
