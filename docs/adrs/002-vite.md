# ADR-002: Vite como Build Tool

## Status

Accepted

## Context

O projeto precisa de um ambiente de desenvolvimento com HMR (Hot Module Replacement) ágil e um processo de build de produção confiável. A escolha do build tool afeta diretamente a velocidade do ciclo de desenvolvimento e a qualidade do output final. As alternativas principais para projetos React em 2024 são Vite, Create React App (CRA) e Next.js.

## Decision

Usar **Vite** como build tool e servidor de desenvolvimento.

Vite usa esbuild para transformação em desenvolvimento (extremamente rápido) e Rollup para o build de produção (otimizado). A configuração TypeScript é nativa via `vite.config.ts`, sem necessidade de ejetar ou manter configurações de Webpack.

## Consequences

**Positivas:**
- HMR praticamente instantâneo — mudanças refletem no browser em menos de 100ms
- Build de produção via Rollup com tree-shaking agressivo
- Configuração mínima: zero customização necessária para o projeto atual
- Suporte nativo a TypeScript, CSS modules e importação de assets
- Output de referência: ~284KB JS / ~30KB CSS (gzipado: ~85KB / ~6KB)

**Negativas:**
- Sem server-side rendering nativo (não necessário para o projeto atual)
- Diferença entre o bundler de dev (esbuild) e de prod (Rollup) pode causar discrepâncias raras

## Alternatives Considered

- **Create React App (CRA)** — em modo de manutenção desde 2023, Webpack lento, sem suporte ativo; descartado
- **Next.js** — SSR e file-based routing poderosos, mas o projeto é uma SPA sem necessidades de SSR ou SEO crítico no momento; overhead desnecessário
- **Parcel** — zero-config como o Vite, mas ecossistema menor e menos adotado em projetos React modernos
