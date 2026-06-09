# Eventing

Plataforma para descobrir, criar e participar de eventos locais.
Interface "Living City" — dark mode editorial com identidade noturna e vibrante.

Design exportado pelo Stitch em `stitch_eventing_living_city_interface/`.
Código em `app/`.

---

## Product Vision

Eventing conecta pessoas a experiências urbanas em tempo real. O produto tem três arcos de uso:

- **Explorador** — descobre eventos por localização, categoria e curadoria social
- **Participante** — compra ingresso, vê quem vai, interage com o coletivo
- **Organizador** — cria, gerencia e transmite eventos com ferramentas visuais

A interface reflete a energia da cidade à noite: superfícies escuras, acentos mint green, tipografia editorial (Playfair Display), animações de "pulso vivo" (Activity Pulse, Live badges).

---

## Tech Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | React + TypeScript | 18 / ~6 |
| Build | Vite | 8 |
| Estilos | Tailwind CSS | v3 (não v4) |
| Roteamento | React Router | v6 |
| Animações | Framer Motion | 12 |
| Ícones | Material Symbols Outlined | Google Fonts |
| Fontes | Inter + Playfair Display | Google Fonts |

> **Tailwind v3 é obrigatório.** O design system usa `tailwind.config.ts` com `theme.extend` — API incompatível com v4.

---

## Core Principles

- **Mobile First** — classes base definem mobile; `md:` e `lg:` sobrescrevem para telas maiores
- **Reutilização** — nenhuma lógica de apresentação duplicada; usar componentes existentes antes de criar novos
- **TypeScript Strict** — zero erros de tipo; interfaces explícitas em todos os componentes
- **Sem `any`** — usar tipos genéricos ou `unknown`; `any` implícito é erro de build
- **Sem styled-components** — Tailwind é o único sistema de estilos; proibido qualquer CSS-in-JS
- **Design system centralizado** — toda cor, tamanho e sombra vem dos tokens em `tailwind.config.ts`; nenhum valor hardcoded (`#7be7b4` → `primary-container`)
- **Fidelidade ao Stitch** — o design exportado é fonte de verdade; não inventar estilos fora do sistema

---

## Architecture

O projeto segue **Atomic Design** com três níveis de componentes e dependência unidirecional estrita:

```
pages → organisms → molecules → atoms
```

Nenhum nível importa de um nível acima. Páginas não contêm lógica de UI própria.

```
app/src/
├── components/
│   ├── atoms/       # Sem dependências internas; mapeiam tokens do design
│   ├── molecules/   # Compostos de 2–4 átomos; encapsulam padrões recorrentes
│   └── organisms/   # Seções completas; podem ter estado local
├── pages/           # Montam organismos; uma por rota
├── hooks/           # Custom hooks compartilhados
└── types/           # Interfaces e tipos globais
```

Documentação detalhada:
- [`docs/architecture.md`](docs/architecture.md) — estrutura, princípios, convenções de código
- [`docs/components.md`](docs/components.md) — todos os 20 componentes com props e notas de uso
- [`docs/routes.md`](docs/routes.md) — 4 rotas com layouts, organismos e seções de cada página

---

## Design System

Tokens configurados em `app/tailwind.config.ts` via `theme.extend`. Nunca hardcode valores do design.

Referências rápidas:

| Tipo | Exemplo de classe | Token |
|---|---|---|
| Cor de ação | `bg-primary-container` | `#7be7b4` — botões, bordas ativas, glows |
| Cor de texto | `text-on-surface` | `#e2e2e3` — texto principal |
| Cor de alerta | `text-secondary` | `#ffb3b0` — exclusivo para Live/alertas |
| Sombra mint | `shadow-mint-glow` | `0 0 20px rgba(123,231,180,0.3)` |
| Glassmorphism | componente `GlassPanel` | `rgba(19,22,24,0.6)` + `backdrop-filter: blur(20px)` |
| Tipografia serif | `font-serif` | Playfair Display — headlines, hero |
| Tipografia sans | `font-sans` | Inter — UI, body, labels |

Documentação completa: [`docs/design-system.md`](docs/design-system.md)

---

## ADRs

Todas as decisões arquiteturais estão registradas em [`docs/adrs/`](docs/adrs/).

| ADR | Decisão |
|---|---|
| [001](docs/adrs/001-react-typescript.md) | React 18 + TypeScript |
| [002](docs/adrs/002-vite.md) | Vite (não CRA, não Next.js) |
| [003](docs/adrs/003-tailwind-css.md) | Tailwind v3 travado na versão |
| [004](docs/adrs/004-mobile-first.md) | Mobile First |
| [005](docs/adrs/005-atomic-design.md) | Atomic Design |
| [006](docs/adrs/006-react-router.md) | React Router v6 |
| [007](docs/adrs/007-framer-motion.md) | Framer Motion para micro-interações JS |
| [008](docs/adrs/008-no-styled-components.md) | Sem styled-components |
| [009](docs/adrs/009-design-system-tokens.md) | Tokens do Stitch como fonte única de verdade |
| [010](docs/adrs/010-typescript-strict.md) | TypeScript strict + verbatimModuleSyntax |

---

## AI Agents

Agentes especializados disponíveis em `.claude/agents/`. Cada agente lê um subconjunto específico da documentação e tem foco bem delimitado.

| Agente | Arquivo | Quando usar |
|---|---|---|
| **Architecture Agent** | `.claude/agents/architecture-agent.md` | Decidir onde colocar um componente; revisar hierarquia; avaliar se uma abstração faz sentido; prevenir duplicação |
| **React Engineer** | `.claude/agents/react-engineer.md` | Implementar componente, hook, página ou rota; dúvidas sobre padrões de hooks; roteamento |
| **Design System Guardian** | `.claude/agents/design-system-guardian.md` | Qualquer mudança visual: cor, tipografia, espaçamento, glassmorphism, responsividade, animação |
| **QA Agent** | `.claude/agents/qa-agent.md` | Revisão antes de merge; validação de acessibilidade; verificação de edge cases; checagem de regressões |
| **Documentation Agent** | `.claude/agents/documentation-agent.md` | Após mudança estrutural: atualizar `docs/`, criar ADR, sincronizar `CLAUDE.md` |

### Checklists

| Checklist | Arquivo | Quando usar |
|---|---|---|
| Feature Review | `.claude/checklists/feature-review.md` | Ao finalizar qualquer feature |
| UI Review | `.claude/checklists/ui-review.md` | Ao finalizar qualquer mudança visual |
| Release Review | `.claude/checklists/release-review.md` | Antes de merge para branch principal |

### Templates

| Template | Arquivo | Quando usar |
|---|---|---|
| Componente | `.claude/templates/component-template.md` | Criar átomo, molécula ou organismo |
| Página | `.claude/templates/page-template.md` | Criar nova página/rota |
| Hook | `.claude/templates/hook-template.md` | Criar custom hook em `src/hooks/` |
| ADR | `.claude/templates/adr-template.md` | Registrar nova decisão arquitetural |

---

## Development Workflow

Todo o código fica em `app/`. Rodar os comandos a partir desta pasta.

```bash
cd app
npm install     # instalar dependências
npm run dev     # servidor de desenvolvimento (http://localhost:5173)
```

### Checklist obrigatório antes de finalizar qualquer tarefa

```bash
cd app
npm run lint     # zero erros de lint
npm run build    # inclui tsc -b (type check) + vite build
```

> `npm run build` já executa `tsc -b` internamente. Não há script `typecheck` separado.

A tarefa só está concluída quando **ambos os comandos passam sem erros**.

---

## Coding Standards

| Convenção | Regra |
|---|---|
| Nomes de componentes | PascalCase — `Button.tsx`, `TopNavBar.tsx` |
| Props | Interface explícita antes do componente; nunca inline para props não triviais |
| Imports de tipo | `import { type Foo }` obrigatório — exigido por `verbatimModuleSyntax` |
| Classes Tailwind condicionais | Array + `.join(' ')` para legibilidade |
| Comentários | Apenas quando o *porquê* não é óbvio; nunca descrever o que o código faz |
| Responsividade | Classe base = mobile; `md:` e `lg:` ampliam para telas maiores |
| Animações de marca | CSS puro em `index.css` (`pulse-ring`, `breath`, `pulse-red`); não usar Framer Motion |
| Framer Motion | Apenas para micro-interações orientadas a eventos JS (parallax, spring) |
| `style` prop | Apenas para valores impossíveis de expressar como classe Tailwind (`fontVariationSettings`, posições dinâmicas) |

---

## What AI Agents Must Avoid

### Estilos
- ❌ `styled-components`, `emotion`, `stitches` ou qualquer CSS-in-JS
- ❌ Valores hardcoded de cor, tamanho ou sombra fora de `tailwind.config.ts` (ex: `color: '#7be7b4'`, `padding: '24px'`)
- ❌ Classes Tailwind inventadas que não existem nos tokens configurados
- ❌ CSS inline (`style={{}}`) para valores que têm classe Tailwind equivalente
- ❌ Sobrescrever `.glass-panel` ou `.glass-nav` diretamente — usar o componente `GlassPanel`

### Componentes
- ❌ Duplicar componentes existentes — verificar `atoms/`, `molecules/`, `organisms/` antes de criar
- ❌ Importar de um nível acima na hierarquia (ex: átomo importando molécula)
- ❌ Lógica de negócio dentro de componentes visuais (fetch, transformação de dados, regras de negócio)
- ❌ Estado global prematuro — criar store só quando houver dados realmente compartilhados entre páginas
- ❌ `any` — nem implícito nem explícito

### Design
- ❌ Ignorar tokens do design system — `primary-container` ≠ `primary` (ver ADR-009)
- ❌ Usar `secondary` como cor de destaque genérica — reservado exclusivamente para Live/alertas (ver `docs/design-system.md`)
- ❌ Inventar estilos fora do vocabulário visual do Stitch
- ❌ Atualizar Tailwind para v4 sem decisão explícita (ver ADR-003)

### TypeScript
- ❌ `any` (explícito ou via cast `as any`)
- ❌ `import { Foo }` para tipos — usar `import { type Foo }`
- ❌ Avançar sem passar em `npm run build`
