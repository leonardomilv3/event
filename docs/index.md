---
type: index
status: current
date: 2026-10-15
tags: [vault, mapa]
---

# Eventing — mapa do vault

Conhecimento e histórico do Eventing: arquitetura do frontend, decisões, produto, experimentos e o diário de desenvolvimento. Convenções (tipos, status, frontmatter, links) em [vault-guide.md](vault-guide.md).

## Arquitetura (frontend)

- [Arquitetura](architecture.md): stack, estrutura de pastas, princípios e convenções
- [Componentes](components.md): inventário Atomic Design com props
- [Rotas e páginas](routes.md): rotas, layouts e organismos por página
- [Design system](design-system.md): tokens, tipografia, glassmorphism, animações
- [Development workflow](development-workflow.md): scripts, build e checklist pré-merge

## Decisões

- [ADRs do frontend](adrs/README.md): índice dos ADRs 001–013
- [Decisões arquiteturais](decisions.md): decisões menores e exceções registradas
- ADRs do backend ficam fora do vault, em `api/docs/adrs/` na raiz do repositório

## Produto

- [Priorização da fase de discovery](product/priorizacao.md): P0–P3 e backlog

## Experimentos

- [Funil de compartilhamento](experiments/funil-compartilhamento.md): share → participação e retenção D7

## Operação

- [Runbooks](runbooks/): procedimentos operacionais e postmortems (vazio por enquanto)

## Prompts

- [Prompts](prompts/): prompt-documents executados pelo Claude Code (vazio por enquanto)

## Journal

- [Journal](journal/): um arquivo por dia (`AAAA-MM-DD.md`), criado por `/log-session` ou pela daily note do Obsidian

## Templates

- [Templates](_templates/): adr, experiment, prompt, journal, runbook, postmortem
