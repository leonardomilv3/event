---
description: Registra a sessão atual no journal do vault (docs/journal/AAAA-MM-DD.md), sem commitar
argument-hint: "[foco opcional da sessão]"
allowed-tools: Bash(date:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(bash scripts/check-vault.sh), Read, Glob, Grep, Write(docs/**), Edit(docs/**)
---

# Registrar sessão no journal

## Contexto coletado agora

- Data real: !`date +%F`
- Hora real: !`date +%H:%M`
- Status: !`git status --short`
- Diff: !`git diff --stat`
- Diff staged: !`git diff --cached --stat`
- Últimos commits: !`git log --oneline -10`

Foco indicado pelo usuário (pode estar vazio): $ARGUMENTS

## O que fazer

1. **Data**: use exatamente a data e a hora acima. Nunca presuma a data; se vierem vazias, rode `date +%F` e `date +%H:%M`.
2. **Resumo**: resuma a sessão a partir desta conversa, do status, dos diffs e dos commits acima. Registre o que foi decidido e o porquê, não uma lista de arquivos tocados.
3. **Arquivo** `docs/journal/<data>.md`:
   - **Se não existir**, crie seguindo a estrutura de `docs/_templates/journal.md` (leia o template antes), substituindo as variáveis: `{{date}}` vira a data real; nenhuma `{{...}}` pode sobrar. Frontmatter: `type: journal`, `status: current`, `date: <data>`, `tags: [journal]` e `related` com os caminhos relativos das notas ligadas no passo 4. Preencha as seções Contexto, Decisões, Mudanças, Pendências (checklist `- [ ]`) e Links.
   - **Se já existir** (por exemplo, criado como daily note pelo Obsidian), **não sobrescreva**: leia o arquivo e acrescente no fim uma seção `## Sessão <HH:MM>` com as subseções `### Contexto`, `### Decisões`, `### Mudanças`, `### Pendências` e `### Links`. Se o arquivo veio vazio do template, pode preencher as seções existentes em vez de criar a seção de sessão. Acrescente em `related` do frontmatter as notas novas, sem remover as existentes.
4. **Links**: ligue com links Markdown relativos a partir de `docs/journal/` (ex.: `../adrs/012-posthog-funnel-analytics.md`) os ADRs, prompts (`docs/prompts/`), experimentos (`docs/experiments/`) e notas de produto tocados ou discutidos. Nunca use `[[wikilinks]]`. Commits entram como hash curto em texto.
5. **Prompts executados**: se um prompt-document de `docs/prompts/` foi executado nesta sessão, mude seu frontmatter para `status: executed` e acrescente o link para o commit ou PR na seção "Links" dele. Se não estiver claro que ele foi executado por completo, **pergunte ao usuário antes** de mudar.
6. **Sem segredos**: nunca inclua valores de tokens, chaves, senhas, URLs com credenciais, e-mails ou saídas de comando que contenham credenciais. Cite só nomes de variáveis (`VITE_POSTHOG_KEY`).
7. **Validação**: rode `bash scripts/check-vault.sh` e corrija o que for apontado nas notas que você escreveu.
8. **Não faça commit** nem `git add`. Ao final, mostre o caminho do arquivo e um resumo de uma linha do que foi registrado.
