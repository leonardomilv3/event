# Development Workflow

---

## Pré-requisitos

- Node.js 18+
- npm 9+

---

## Instalação

```bash
cd app
npm install
```

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR (porta padrão: 5173) |
| `npm run dev -- --port 3000` | Servidor em porta customizada |
| `npm run build` | Type-check (tsc) + build de produção (Vite) |
| `npm run preview` | Pré-visualizar o build de produção localmente |
| `npm run lint` | Verificar erros de lint (ESLint) |

---

## Build de produção

```bash
cd app
npm run build
```

O comando executa em sequência:
1. `tsc -b` — validação TypeScript (falha se houver erros)
2. `vite build` — empacotamento e otimização

Output em `app/dist/`. Tamanhos de referência: ~284KB JS / ~30KB CSS (gzipado: ~85KB / ~6KB).

---

## Validações obrigatórias

Antes de avançar qualquer fase ou abrir PR:

```bash
# Zero erros TypeScript
npx tsc --noEmit

# Build completo sem warnings críticos
npm run build
```

**Regra:** nenhum `any` implícito, nenhum import de tipo sem `type` keyword (exigido por `verbatimModuleSyntax`).

---

## Fases de implementação (histórico)

| Fase | Descrição | Status |
|---|---|---|
| **1** | Setup: Vite + React + TS + Tailwind + Router + tokens + globals CSS | ✅ Concluída |
| **2** | Átomos (Button, TagChip, ActivityPulse, Icon, ProgressBar) + Moléculas | ✅ Concluída |
| **3** | Organismos (TopNavBar, SideNavBar, BottomNav, FAB, Carousel, Footer) | ✅ Concluída |
| **4a** | Página: EventManagement | ✅ Concluída |
| **4b** | Página: LandingPage | ✅ Concluída |
| **4c** | Página: UserDashboard | ✅ Concluída |
| **4d** | Página: EventDetail | ✅ Concluída |
| **5** | Micro-interações: parallax hero, FAB tooltip, scroll TopNavBar, drag carousel | ✅ Concluída |

---

## Checklist antes de merge

- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm run build` sem erros
- [ ] Novo componente segue a hierarquia atoms → molecules → organisms
- [ ] Nenhuma classe Tailwind hardcoded que deveria ser um token (`#7be7b4` → `primary-container`)
- [ ] Responsividade verificada: mobile (375px), tablet (768px), desktop (1440px)
- [ ] Imports de tipo usam `import { type Foo }`
- [ ] Nenhum `addEventListener` direto ao DOM sem cleanup no `useEffect`
- [ ] `IMPLEMENTATION_PLAN.md` e docs relevantes atualizados se houver mudança estrutural
