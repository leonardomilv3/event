---
type: reference
status: current
date: 2026-10-15
tags: [vault, convencoes]
related:
  - index.md
---

# Guia do vault

`docs/` é ao mesmo tempo a pasta de documentação do repositório e um vault do Obsidian. As notas precisam funcionar igual no Obsidian, no GitHub e no Claude Code. Por isso valem as regras abaixo.

## Tipos de nota e onde ficam

| `type` | Pasta | O que vai |
|---|---|---|
| `index` | `docs/` | Mapas de navegação ([index.md](index.md)) |
| `product` | `product/` | Visão, priorização, escopo, personas |
| `architecture` | `docs/` | Estrutura, convenções, design system, rotas, componentes |
| `reference` | `docs/` ou pasta do assunto | Material de consulta (este guia, workflow de desenvolvimento) |
| `adr` | `adrs/` | Architecture Decision Records do frontend (`NNN-titulo-kebab-case.md`) |
| `decision-log` | `docs/` | Decisões menores ou implícitas ([decisions.md](decisions.md)) |
| `runbook` | `runbooks/` | Procedimentos operacionais passo a passo |
| `experiment` | `experiments/` | Hipóteses de produto medidas com dados |
| `prompt` | `prompts/` | Prompt-documents entregues ao Claude Code para executar trabalho em fases |
| `journal` | `journal/` | Registro diário de sessões (`AAAA-MM-DD.md`) |
| `postmortem` | `runbooks/` | Análise de incidente (a definir se ganha pasta própria quando houver o primeiro) |

ADRs de backend continuam em `api/docs/adrs/`, fora do vault.

## Status permitidos por tipo

| Tipo | Valores |
|---|---|
| `adr` | `proposed` \| `accepted` \| `superseded` \| `deprecated` |
| `prompt` | `draft` \| `executed` \| `superseded` |
| `experiment` | `draft` \| `running` \| `concluded` |
| demais | `draft` \| `current` \| `archived` |

## Frontmatter

Obrigatório em toda nota (exceto `_templates/`):

```yaml
---
type: adr          # um dos tipos acima
status: accepted   # um dos status do tipo
date: 2026-10-15   # AAAA-MM-DD: criação da nota
tags: [opcional]
related:           # opcional: caminhos relativos a esta nota
  - ../decisions.md
---
```

## Regras

- **Links sempre em Markdown relativo**: `[texto](../adrs/012-posthog-funnel-analytics.md)`. Nunca `[[wikilinks]]`: o GitHub não os renderiza. O Obsidian já está configurado para gerar links assim (`.obsidian/app.json`).
- **Uma nota por assunto**, com título descritivo (o `# Título` da nota e o nome do arquivo dizem do que se trata).
- **ADR aceito não se edita.** Para mudar a decisão, crie um ADR novo; o antigo passa a `superseded` e os dois se linkam (o novo cita o que substitui; o antigo ganha "Superseded by ADR-NNN"). Correções de digitação e o frontmatter são as únicas exceções.
- **Nenhum segredo.** Só nomes de variáveis (`VITE_POSTHOG_KEY`), nunca valores, tokens, URLs com senha ou chaves.
- **Journal** em `journal/AAAA-MM-DD.md`, um arquivo por dia. Várias sessões no mesmo dia viram seções `## Sessão HH:MM`. No Claude Code, use `/log-session`.
- **Prompt executado** passa a `status: executed` e ganha link para o commit ou PR que o entregou.
- **Templates** ficam em [_templates/](_templates/) e são aplicados pelo plugin core *Templates* do Obsidian (`{{title}}`, `{{date}}`).

## Verificação automática

Na raiz do repositório:

```bash
bash scripts/check-vault.sh
```

O script sai com código diferente de 0 e lista `arquivo:linha` quando encontra:

- nota sem frontmatter com `type`, `status` e `date` (ignora `_templates/` e `.obsidian/`);
- `[[wikilink]]` fora de bloco de código;
- link relativo apontando para arquivo inexistente;
- padrão de segredo (`sb_secret`, `sb_publishable`, chave privada PEM, `password`/`senha` com valor atribuído, URL com usuário:senha);
- número de ADR duplicado em `adrs/`.

Rode antes de commitar mudanças em `docs/`. O detector de segredos ignora placeholders como `<SENHA>` e `$VAR`, mas é heurístico: não substitui a revisão. Usa só `bash`, `find`, `grep`, `awk` e `sed` (GNU).
