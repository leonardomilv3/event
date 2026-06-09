# Arquitetura

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Estilos | Tailwind CSS v3 |
| Roteamento | React Router v6 |
| Animações | Framer Motion |
| Ícones | Material Symbols Outlined (Google Fonts) |
| Fontes | Inter (UI) + Playfair Display (editorial) |

---

## Princípios

- **Mobile first** — classes base para mobile, `md:` e `lg:` para breakpoints maiores
- **Componentes reutilizáveis** — nenhuma lógica de apresentação duplicada entre páginas
- **Sem styled-components** — apenas Tailwind CSS e classes CSS globais em `index.css`
- **Fidelidade ao design** — todos os tokens do Stitch configurados em `tailwind.config.ts`
- **TypeScript estrito** — zero erros antes de qualquer avanço; sem uso de `any`

---

## Estrutura de diretórios

```
app/
├── index.html                  # Classe `dark` + Google Fonts no <head>
├── tailwind.config.ts          # Todos os tokens do design system
├── src/
│   ├── main.tsx                # Entry point — StrictMode + BrowserRouter
│   ├── App.tsx                 # Definição de rotas
│   ├── index.css               # @tailwind + glassmorphism + animações CSS
│   ├── components/
│   │   ├── atoms/              # Sem dependências internas ao projeto
│   │   ├── molecules/          # Compostos de átomos
│   │   └── organisms/          # Compostos de moléculas — seções completas
│   ├── pages/                  # Compostos de organismos — uma por rota
│   ├── hooks/                  # Custom hooks compartilhados
│   └── types/                  # Interfaces e tipos globais
└── public/                     # Assets estáticos
```

---

## Organização de componentes

A hierarquia segue Atomic Design com três níveis:

```
atoms      →  sem dependências internas; mapeiam diretamente tokens do design
molecules  →  compostos de 2–4 átomos; encapsulam um padrão de UI recorrente
organisms  →  seções completas; podem conter estado local e lógica de interação
pages      →  montam organismos; não contêm lógica de UI própria
```

**Regra de dependência:** `pages → organisms → molecules → atoms`. Nenhum nível importa de um nível acima.

---

## Convenções de código

| Convenção | Regra |
|---|---|
| Nomes de arquivos | PascalCase para componentes (`Button.tsx`, `TopNavBar.tsx`) |
| Props | Interface explícita antes do componente |
| Classes Tailwind condicionais | Array + `.join(' ')` para legibilidade |
| Comentários | Apenas quando o *porquê* não é óbvio — nunca o *o quê* |
| Imports de tipo | `import { type Foo }` — obrigatório com `verbatimModuleSyntax` |
| Responsividade | Classe base = mobile; `md:` e `lg:` ampliam para telas maiores |
