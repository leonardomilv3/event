# Feature Review Checklist

Use este checklist ao finalizar qualquer nova feature ou modificação de componente.
Baseado em `docs/development-workflow.md` § Checklist antes de merge.

---

## 1. Build e tipos

```bash
cd app
npm run lint     # deve passar sem erros
npm run build    # tsc -b + vite build — deve passar sem erros
```

- [ ] `npm run lint` sem erros
- [ ] `npm run build` sem erros (inclui type check)
- [ ] Zero `any` no código novo ou modificado
- [ ] Todos os imports de tipo usam `import { type Foo }`

---

## 2. Arquitetura

- [ ] Componente novo está no nível correto: átomo / molécula / organismo / página
- [ ] Nenhum componente duplicado — verificado em `docs/components.md`
- [ ] Regra de dependência respeitada: `pages → organisms → molecules → atoms`
- [ ] Página não contém lógica de UI própria — apenas monta organismos
- [ ] Organismo não contém lógica de negócio (fetch, transformação de dados)

---

## 3. Design system

- [ ] Nenhuma cor hardcoded — apenas tokens Tailwind (`bg-primary-container`, não `bg-[#7be7b4]`)
- [ ] Nenhum tamanho hardcoded — usar tokens de espaçamento (`p-stack-md`, não `p-[24px]`)
- [ ] `primary-container` (não `primary`) para ações e botões
- [ ] `secondary` usado apenas para Live/alertas
- [ ] Glassmorphism via `GlassPanel` — nunca classes inline
- [ ] Sombras via `shadow-mint-glow*` — nunca sombras padrão Tailwind

---

## 4. Responsividade

- [ ] Mobile first: classe base define mobile, `md:` e `lg:` sobrescrevem
- [ ] Verificado em 375px (mobile)
- [ ] Verificado em 768px (tablet)
- [ ] Verificado em 1440px (desktop)
- [ ] `BottomNav` visível apenas em mobile (`md:hidden`)
- [ ] `SideNavBar` visível apenas em desktop (`hidden md:flex`)

---

## 5. React e hooks

- [ ] `useEffect` com event listeners tem cleanup no `return`
- [ ] Nenhum `addEventListener` direto ao DOM fora de `useEffect`
- [ ] Navegação interna via `<Link>`, não `<a href>`
- [ ] Estado de UI local ao componente — sem store global desnecessário

---

## 6. Documentação

- [ ] Novo componente adicionado em `docs/components.md`
- [ ] Nova rota adicionada em `docs/routes.md` (se aplicável)
- [ ] Nova decisão arquitetural registrada em `docs/decisions.md` e/ou novo ADR
