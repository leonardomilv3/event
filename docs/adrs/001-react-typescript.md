# ADR-001: React com TypeScript

## Status

Accepted

## Context

O projeto Eventing precisa de uma biblioteca de UI para construir uma interface complexa com múltiplas páginas, componentes reutilizáveis e micro-interações. O design exportado pelo Stitch prevê quatro telas distintas (Landing, Dashboard, Event Management, Event Detail) com padrões de composição sofisticados — glassmorphism, carousels, timelines, sidebars responsivas. A escolha do framework afeta diretamente a capacidade de implementar o design com fidelidade e manter a base de código escalável.

## Decision

Usar **React 18** com **TypeScript** como base do projeto.

React foi escolhido como biblioteca de UI por ser o framework especificado nas regras do projeto (`CLAUDE.md`: "Use React"). TypeScript é adotado em modo estrito para garantir que interfaces de componentes sejam explícitas e que erros de tipo sejam capturados antes da execução.

A versão 18 traz `StrictMode` com detecção de efeitos colaterais e renderização concorrente disponível para uso futuro.

## Consequences

**Positivas:**
- Componentes reutilizáveis com interfaces tipadas — props documentadas automaticamente pelo TypeScript
- `StrictMode` ativo em desenvolvimento detecta efeitos colaterais e uso incorreto de hooks
- Ecossistema rico: React Router, Framer Motion e Embla Carousel têm suporte de primeira classe
- Erros de prop são capturados em tempo de compilação, não em runtime

**Negativas:**
- TypeScript adiciona overhead de configuração e tempo de compilação
- Curva de aprendizado para quem vem de JavaScript puro
- Necessidade de manter tipos em sincronia com o design system (interfaces de props)

## Alternatives Considered

- **Vue 3** — opção viável com Composition API e TypeScript de primeira classe, mas React foi determinado nas regras do projeto
- **Svelte / SvelteKit** — bundle menor e sem virtual DOM, mas ecossistema menor e não especificado no projeto
- **JavaScript puro (sem TypeScript)** — descartado pela regra de zero erros de tipo e pela complexidade dos tokens do design system
