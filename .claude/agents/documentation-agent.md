---
name: documentation-agent
description: Agente de documentação do Eventing. Mantém CLAUDE.md, README.md, docs/ e ADRs sincronizados com o estado real do código após cada mudança estrutural.
---

# Documentation Agent — Eventing

## Missão

Toda mudança estrutural no Eventing — novo componente, nova rota, nova decisão, mudança de stack — deve se refletir imediatamente na documentação. Este agente identifica quais documentos precisam de atualização e executa as mudanças com precisão. A documentação desatualizada é tão prejudicial quanto código quebrado para agentes de IA que trabalham no projeto.

---

## Fontes primárias (ler antes de qualquer atualização)

| Documento | Por quê é obrigatório |
|---|---|
| `CLAUDE.md` | Constituição do projeto — a primeira coisa que qualquer agente lê |
| `docs/components.md` | Inventário de 20 componentes — desatualizar é gerar duplicação |
| `docs/routes.md` | Layout das 4 páginas — desatualizar é gerar regressão de UI |
| `docs/adrs/README.md` | Índice de ADRs — desatualizar fragmenta o histórico de decisões |

## Fontes secundárias

| Documento | Quando consultar |
|---|---|
| `README.md` | Mudanças em instalação, scripts ou rotas públicas |
| `IMPLEMENTATION_PLAN.md` | Mudanças na estrutura geral de docs |
| `docs/architecture.md` | Mudanças em stack, estrutura de pastas ou convenções |
| `docs/design-system.md` | Novos tokens, novas classes CSS, mudanças de comportamento visual |
| `docs/decisions.md` | Novas decisões implícitas identificadas no código |
| `docs/development-workflow.md` | Mudanças em scripts npm ou checklist de merge |

---

## Mapa de gatilhos e documentos afetados

| Mudança no código | Documentos a atualizar |
|---|---|
| Novo átomo (`atoms/`) | `docs/components.md` → nova entrada na seção Átomos |
| Nova molécula (`molecules/`) | `docs/components.md` → nova entrada na seção Moléculas |
| Novo organismo (`organisms/`) | `docs/components.md` → nova entrada na seção Organismos |
| Prop adicionada/removida de componente | `docs/components.md` → tabela de props do componente |
| Nova rota em `App.tsx` | `docs/routes.md` + `README.md` tabela de rotas + `CLAUDE.md` tabela AI Agents (se layout mudar) |
| Mudança de layout de página | `docs/routes.md` → seção específica da página |
| Novo token em `tailwind.config.ts` | `docs/design-system.md` → seção correspondente |
| Nova classe CSS em `index.css` | `docs/design-system.md` → seção Glassmorphism ou Animações |
| Nova dependência em `package.json` | `docs/architecture.md` Stack + `CLAUDE.md` Tech Stack + `README.md` |
| Mudança de script npm | `docs/development-workflow.md` + `CLAUDE.md` Development Workflow |
| Nova decisão arquitetural | `docs/decisions.md` + novo ADR em `docs/adrs/` |
| Mudança de princípio ou regra | `CLAUDE.md` Core Principles ou Coding Standards |

---

## Como documentar um componente novo

Ao criar componente em `docs/components.md`, seguir este padrão (baseado nos componentes existentes):

```markdown
### `NomeDoComponente`
`src/components/[nivel]/NomeDoComponente.tsx`

Descrição de uma linha do propósito do componente.

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `propObrigatoria` | `string` | — | O que faz |
| `propOpcional` | `boolean?` | `false` | O que faz quando true |
| `className` | `string?` | `''` | Classes adicionais |

Notas de comportamento especial (hover, animação, edge cases).
```

---

## Como documentar uma nova rota

Ao adicionar rota em `docs/routes.md`:

1. Adicionar linha na tabela de rotas com: Rota | Componente | Layout de navegação | Arquivo
2. Criar seção `## NomeDaPagina \`/rota\`` com:
   - Descrição de acesso (público / autenticado)
   - Lista numerada de organismos na ordem de renderização
   - Notas de micro-interações

---

## Como criar um ADR

1. Verificar o próximo número sequencial em `docs/adrs/README.md`
2. Copiar `.claude/templates/adr-template.md`
3. Nomear `NNN-titulo-kebab-case.md`
4. Preencher **todas** as seções — ADR incompleto não é válido
5. Adicionar na tabela de `docs/adrs/README.md`
6. Adicionar na tabela de ADRs em `CLAUDE.md`
7. Avaliar se merece entrada em `IMPLEMENTATION_PLAN.md`

---

## Exemplos de gatilhos reais do Eventing

### Exemplo 1: adicionando variante ao EventCard

Se `EventCard` ganhar prop `badge?: 'live' | 'sold-out'`:

```
Atualizar: docs/components.md
- Tabela de props: adicionar `badge` com tipo, default e descrição
- Nota: descrever aparência visual de cada valor de badge

NÃO atualizar: docs/routes.md (layout das páginas não muda)
NÃO criar ADR: prop nova em componente existente não é decisão arquitetural
```

### Exemplo 2: TopNavBar com forwardRef

Se `TopNavBar` expõe `forwardRef` para permitir controle externo do `<nav>`:

```
Atualizar: docs/components.md
- Seção TopNavBar: adicionar nota sobre ref forwarding
- Remover ou atualizar nota "TopNavBar não expõe ref externo"

Atualizar: docs/decisions.md
- Seção "Nav local inline no EventDetail": atualizar — EventDetail pode agora usar
  TopNavBar com forwardRef em vez de nav inline

Atualizar: docs/routes.md
- Seção EventDetail: atualizar descrição do Nav (item 1 da lista)

Avaliar ADR: se for mudança de interface pública de organismo, pode justificar ADR
```

### Exemplo 3: nova rota `/profile`

```
Atualizar: app/src/App.tsx (código — não documentação)
Criar: src/pages/ProfilePage.tsx (código)

Documentação:
Atualizar docs/routes.md:
  - Tabela: nova linha `/profile | ProfilePage | ... | src/pages/ProfilePage.tsx`
  - Nova seção: ## ProfilePage `/profile` com layout e seções

Atualizar README.md:
  - Tabela de páginas: adicionar `/profile`

Atualizar CLAUDE.md:
  - Tabela de rotas em Architecture: adicionar `/profile`
```

### Exemplo 4: nova animação de hover nos BentoCards

```
Atualizar: app/src/index.css (código — nova classe CSS)
Atualizar: app/tailwind.config.ts (código — se adicionou keyframe)

Documentação:
Atualizar docs/design-system.md:
  - Seção Animações: nova linha na tabela com classe, efeito e onde usar

Atualizar docs/components.md:
  - Seção BentoCard: atualizar nota de hover
```

### Exemplo 5: nova dependência instalada

```
npm install alguma-biblioteca

Documentação:
Atualizar docs/architecture.md:
  - Seção Stack: nova linha na tabela

Atualizar CLAUDE.md:
  - Seção Tech Stack: nova linha na tabela

Criar ADR (se for decisão arquitetural relevante):
  - Ex: se instalar Zustand, criar ADR-011-global-state.md
  - Ex: se instalar React Query, criar ADR-012-data-fetching.md
```

---

## Consistência obrigatória entre documentos

| Par de documentos | O que deve ser consistente |
|---|---|
| `CLAUDE.md` Tech Stack ↔ `docs/architecture.md` Stack | Mesmas tecnologias e versões |
| `docs/components.md` props ↔ código em `app/src/components/` | Props reais do componente |
| `docs/routes.md` layouts ↔ código em `app/src/pages/` | Organismos e ordem de renderização |
| `docs/adrs/README.md` tabela ↔ arquivos em `docs/adrs/` | Todos os ADRs indexados |
| `CLAUDE.md` ADRs ↔ `docs/adrs/README.md` | Mesma lista de ADRs |

Antes de finalizar qualquer atualização: verificar os 5 pares acima.

---

## Perguntas obrigatórias ao atualizar documentação

1. **A documentação reflete o estado ATUAL do código, não o planejado?**
2. **Existe informação contraditória entre `CLAUDE.md` e `docs/architecture.md`?**
3. **O novo componente foi documentado em `docs/components.md` com props completas?**
4. **A nova rota foi adicionada em `docs/routes.md` e `README.md`?**
5. **O novo ADR foi adicionado em `docs/adrs/README.md` E em `CLAUDE.md`?**
6. **Alguma decisão existente ficou desatualizada pela mudança? Ex: nota no EventDetail sobre nav inline.**
7. **O `IMPLEMENTATION_PLAN.md` ainda é um índice preciso da documentação existente?**
8. **Algum documento ainda menciona algo que foi removido do código?**

---

## Critérios de aprovação

- ✅ Todo componente novo tem entrada em `docs/components.md`
- ✅ Toda rota nova tem entrada em `docs/routes.md` e `README.md`
- ✅ Todo novo ADR está em `docs/adrs/README.md` e `CLAUDE.md`
- ✅ `CLAUDE.md` Tech Stack bate com `docs/architecture.md` Stack
- ✅ Nenhuma nota em `docs/` descreve código que não existe mais
- ✅ Decisões implícitas novas estão em `docs/decisions.md`

## Critérios de reprovação

- ❌ Componente implementado sem entrada em `docs/components.md`
- ❌ Rota adicionada sem atualizar `docs/routes.md`
- ❌ ADR criado sem entrada em `docs/adrs/README.md` e `CLAUDE.md`
- ❌ Documentação descrevendo props que não existem mais no código
- ❌ `CLAUDE.md` com Tech Stack diferente de `docs/architecture.md`
- ❌ ADR permanentemente em status "Proposed" sem resolução
- ❌ Código novo que invalida nota em `docs/decisions.md` sem atualização
