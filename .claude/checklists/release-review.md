# Release Review Checklist

Checklist completo antes de qualquer release ou merge para a branch principal.
Combina validações de build, qualidade, design e documentação.

---

## 1. Build obrigatório

```bash
cd app
npm run lint && npm run build
```

- [ ] `npm run lint` — zero erros, zero warnings críticos
- [ ] `npm run build` — `tsc -b` + `vite build` sem erros
- [ ] Output de referência: ~284KB JS / ~30KB CSS — alertar se bundle crescer >20%

---

## 2. TypeScript

- [ ] Zero `any` em todo o código (grep: `as any`, `: any`)
- [ ] Zero imports de tipo sem `type` keyword
- [ ] Todas as interfaces de props explícitas e nomeadas
- [ ] Sem `@ts-ignore` ou `@ts-expect-error` sem comentário justificando

---

## 3. Arquitetura

- [ ] Hierarquia Atomic Design intacta — nenhuma importação invertida
- [ ] Nenhum componente duplicado introduzido
- [ ] Páginas não contêm lógica de UI própria
- [ ] Organismos sem lógica de negócio
- [ ] `useEffect` com listeners tem cleanup

---

## 4. Design system

- [ ] Zero valores hardcoded de cor (`#`, `rgb`, `hsl`)
- [ ] Zero valores hardcoded de tamanho (`px`, `rem` arbitrários fora de tokens)
- [ ] `primary-container` para ações; `secondary` apenas para alertas
- [ ] Glassmorphism via `GlassPanel` — verificar com grep por `backdrop-filter` inline
- [ ] Tailwind v3 — confirmar que `package.json` não foi atualizado para v4

---

## 5. Responsividade

Verificar as 4 páginas nos 3 breakpoints (375px / 768px / 1440px):

| Página | Mobile | Tablet | Desktop |
|---|---|---|---|
| `/` LandingPage | [ ] | [ ] | [ ] |
| `/dashboard` UserDashboard | [ ] | [ ] | [ ] |
| `/events` EventManagement | [ ] | [ ] | [ ] |
| `/events/:id` EventDetail | [ ] | [ ] | [ ] |

---

## 6. Funcionalidades críticas

- [ ] `TopNavBar`: glassmorphism + scroll behavior funcionando
- [ ] `SideNavBar`: link ativo correto por rota
- [ ] `BottomNav`: visível apenas em mobile, FAB central funcional
- [ ] `EventCardCarousel`: drag-to-scroll funcionando, setas desktop funcionando
- [ ] `FAB`: shimmer + tooltip no hover, `mobileOnly` ocultando em desktop
- [ ] `FilterTabs` no EventManagement: filtro alternando corretamente
- [ ] `SearchInput`: mint glow no focus
- [ ] Persistent CTA no EventDetail: mobile (fixed bottom) e desktop (floating) corretos
- [ ] Animações: Activity Pulse, Pulse Dot, Live badge — verificar que rodam

---

## 7. Acessibilidade

- [ ] Botões icon-only têm `aria-label`
- [ ] Imagens têm `alt` descritivo
- [ ] Links internos são `<Link>`, não `<a>` sem controle de navegação
- [ ] Elementos interativos acessíveis via teclado (Tab, Enter, Space)

---

## 8. Documentação

- [ ] `docs/components.md` reflete novos ou modificados componentes
- [ ] `docs/routes.md` reflete mudanças de layout ou novas rotas
- [ ] Novas decisões arquiteturais em `docs/decisions.md` ou novo ADR
- [ ] `CLAUDE.md` atualizado se mudou stack, princípio ou workflow
- [ ] `IMPLEMENTATION_PLAN.md` e `docs/adrs/README.md` com novos ADRs adicionados

---

## 9. Regressões

Confirmar que as features existentes não foram quebradas:

- [ ] LandingPage: hero renderiza com pulse dots e botões corretos
- [ ] UserDashboard: stats bento, timeline e gráfico de barras visíveis
- [ ] EventManagement: 5 variantes de card renderizando (Live, Público, Draft, Privado, CTA)
- [ ] EventDetail: hero cinematográfico + sidebar + CTAs persistentes
