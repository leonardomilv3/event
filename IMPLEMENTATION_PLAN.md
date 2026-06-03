# Eventing — Implementation Plan

Fonte de verdade para a implementação React do projeto Eventing / Eventing Interface.
Baseado no design exportado pelo Stitch em `stitch_eventing_living_city_interface/`.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Estilos | Tailwind CSS v3 (sem styled-components) |
| Roteamento | React Router v6 |
| Animações | Framer Motion (parallax, micro-interações) |
| Carousel | Embla Carousel (ou drag nativo) |
| Ícones | Material Symbols Outlined (Google Fonts) |
| Fontes | Inter (UI) + Playfair Display (editorial) |

---

## Regras do Projeto

- React com componentes reutilizáveis
- Mobile first
- Sem styled-components
- Seguir o design do Stitch fielmente
- Zero erros de TypeScript antes de avançar cada fase

---

## Design System

### Tokens principais

Todos configurados em `app/tailwind.config.ts` via `theme.extend`.

#### Cores

| Token | Valor | Uso |
|---|---|---|
| `background` | `#121415` | Base de todas as páginas |
| `surface-container-lowest` | `#0c0e0f` | Seções de fundo mais escuras |
| `surface-container` | `#1e2021` | Cards, painéis |
| `surface-variant` | `#333536` | Elementos interativos de superfície |
| `primary` | `#b3ffd7` | Texto/ícone em destaque (Mint claro) |
| `primary-container` | `#7be7b4` | Botões, bordas ativas, glows |
| `secondary` | `#ffb3b0` | Live Now / alertas — uso restrito |
| `on-surface` | `#e2e2e3` | Texto principal |
| `on-surface-variant` | `#bdcac0` | Texto secundário / metadados |
| `outline-variant` | `#3e4942` | Bordas sutis |

#### Efeitos especiais (CSS)

```css
/* Glassmorphism */
.glass-panel / .glass-nav → rgba(19,22,24,0.6) + backdrop-filter: blur(20px)

/* Mint Glow (Tailwind shadow) */
shadow-mint-glow         → 0 0 20px rgba(123,231,180,0.3)
shadow-mint-glow-strong  → 0 0 30px rgba(123,231,180,0.5)
shadow-mint-glow-xl      → 0 10px 40px rgba(123,231,180,0.3)

/* Gradients (CSS class) */
.hero-gradient      → radial-gradient fundo do hero
.editorial-gradient → linear-gradient sobre imagens de hero
```

#### Tipografia

| Token | Família | Size | Uso |
|---|---|---|---|
| `display-lg` | Playfair Display | 72px | Hero desktop |
| `display-lg-mobile` | Playfair Display | 48px | Hero mobile |
| `headline-lg` | Playfair Display | 40px | Títulos de seção desktop |
| `headline-lg-mobile` | Playfair Display | 32px | Títulos de seção mobile |
| `headline-md` | Playfair Display | 24px | Subtítulos, nomes de cards |
| `body-lg` | Inter | 18px | Descrições longas |
| `body-md` | Inter | 16px | UI geral |
| `label-md` | Inter | 14px | Nav, metadados |
| `label-caps` | Inter | 12px, tracking 0.1em | Tags (TECHNO, LIVE, DRAFT) |

#### Espaçamento (base 8px)

```
stack-xs: 4px    stack-sm: 12px   stack-md: 24px
stack-lg: 48px   stack-xl: 80px   gutter: 24px
margin-mobile: 20px   margin-desktop: 64px
container-max: 1440px
```

#### Border Radius

```
md: 8px (inputs)    lg: 12px (nav items)    xl: 16px (cards)
3xl: 24px (containers grandes)    full: pill/circle
```

#### Animações (CSS keyframes em `index.css`)

| Nome | Efeito | Uso |
|---|---|---|
| `pulse-ring` | Ring expandindo 1x→4x, opacity 0→0 | `.activity-pulse::after` |
| `breath` | Scale 1→3, opacity 0.6→0 | `.pulse-dot::after` (inline) |
| `pulse-red` | Scale + box-shadow pulsante vermelho | Badge LIVE |

---

## Arquitetura de Componentes

```
src/
├── components/
│   ├── atoms/          # Sem dependências internas
│   ├── molecules/      # Compostos de átomos
│   └── organisms/      # Compostos de moléculas — seções completas
├── pages/              # Compostos de organismos — rotas
├── hooks/              # Custom hooks (parallax, drag scroll, etc.)
└── types/              # Tipos e interfaces compartilhados
```

### Átomos

| Arquivo | Props principais | Status |
|---|---|---|
| `Button.tsx` | `variant` (primary/secondary/ghost), `size` (sm/md/lg) | ✅ Concluído |
| `TagChip.tsx` | `label`, `active` | ✅ Concluído |
| `ActivityPulse.tsx` | `top`, `left` (absoluto) + `PulseDot` (inline) | ✅ Concluído |
| `Icon.tsx` | `name`, `fill` (0/1), `weight`, `size` | ✅ Concluído |
| `ProgressBar.tsx` | `value` (0–100) | ✅ Concluído |

### Moléculas

| Arquivo | Composição | Status |
|---|---|---|
| `GlassPanel.tsx` | Container glassmorphism genérico | ✅ Concluído |
| `EventCard.tsx` | Imagem + gradient + TagChip + título + hover glow | ✅ Concluído |
| `StatCard.tsx` | GlassPanel + label-caps + número display | ✅ Concluído |
| `TimelineItem.tsx` | Dot indicador + GlassPanel + tipo/tempo/conteúdo | ✅ Concluído |
| `AgendaItem.tsx` | Número display + título + horário (GlassPanel) | ✅ Concluído |
| `AvatarStack.tsx` | Lista de imgs sobrepostas + overflow "+N" | ✅ Concluído |
| `FilterTabs.tsx` | Segmented control com estado ativo | ✅ Concluído |
| `SearchInput.tsx` | Input + Icon + mint glow no focus | ✅ Concluído |
| `BentoCard.tsx` | Icon + título + descrição + hover border | ✅ Concluído |

### Organismos

| Arquivo | Variantes/Notas | Status |
|---|---|---|
| `TopNavBar.tsx` | Prop `authenticated` alterna avatar simples vs. nome | ✅ Concluído |
| `SideNavBar.tsx` | Links ativos via `useLocation`, prop `topOffset` | ✅ Concluído |
| `BottomNav.tsx` | Mobile only (`md:hidden`), FAB central embutido | ✅ Concluído |
| `FAB.tsx` | Shimmer hover + tooltip label, prop `mobileOnly` | ✅ Concluído |
| `EventCardCarousel.tsx` | Drag-to-scroll com mouse events + setas desktop | ✅ Concluído |
| `Footer.tsx` | Compartilhado entre todas as páginas | ✅ Concluído |

---

## Páginas e Rotas

| Rota | Componente | Layout | Status |
|---|---|---|---|
| `/` | `LandingPage` | TopNavBar + FAB + Footer | ✅ Concluído |
| `/dashboard` | `UserDashboard` | SideNavBar + BottomNav + FAB | ✅ Concluído |
| `/events` | `EventManagement` | TopNavBar + SideNavBar + BottomNav (FAB mobile) | ✅ Concluído |
| `/events/:id` | `EventDetail` | Nav customizado + persistent CTA | ✅ Concluído |

### LandingPage — Seções

1. `TopNavBar` (fixo, glassmorphism)
2. **Hero** — `min-h-screen`, `hero-gradient`, `ActivityPulse` dots flutuantes, ambient blobs `animate-pulse`, headline editorial com deslocamento, 2 botões (primary + secondary)
3. **Carousel** — label "Current Pulse" + `headline-lg` + `EventCardCarousel` com `EventCard`s
4. **Map Section** — `lg:grid-cols-12` (4 texto + 8 mapa mock), dots de `ActivityPulse`, controles de zoom
5. **How it Works** — `grid md:grid-cols-3` com 3 `BentoCard`s
6. `Footer`
7. `FAB`

### UserDashboard — Seções

1. `SideNavBar` (desktop) + `BottomNav` (mobile)
2. **Profile Hero** — imagem full-bleed 400px, `editorial-gradient`, avatar + nome + `PulseDot` + tags de interesse
3. **Stats Bento** — `grid grid-cols-2 md:grid-cols-4`, 4× `StatCard`
4. **Main Layout** — `lg:grid-cols-12`: timeline (7 cols) + sidebar (5 cols)
5. **Timeline** — `border-l` vertical + `TimelineItem`s
6. **Sidebar** — gráfico de barras customizado + draft card com `PulseDot`
7. `FAB`
8. `Footer`

### EventManagement — Seções

1. `TopNavBar` + `SideNavBar`
2. **Header** — título + descrição + botão "Create Event"
3. **Controls** — `FilterTabs` (All/Draft/Public/Private/Live) + `SearchInput`
4. **Card Grid** — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
   - Card **Live** — badge vermelho `animate-pulse-red`, `AvatarStack`, data
   - Card **Public** — badge, botões Edit/Duplicate, contagem registrados
   - Card **Draft** — placeholder de imagem, botão "Finish Setup" (outline)
   - Card **Private** — `lg:col-span-2`, layout horizontal imagem + texto
   - Card **Empty CTA** — dashed border, ícone `add_circle`
5. `FAB` (mobile only)
6. `Footer`

### EventDetail — Seções

1. `TopNavBar`
2. **Hero** — `h-[870px]`, imagem full-bleed, `editorial-gradient`, live indicator com `breath` animation
3. **Content Layout** — `lg:grid-cols-12`: conteúdo (8) + sidebar (4)
4. **Conteúdo** — narrativa, `AgendaItem`s numerados, mapa do venue (mock)
5. **Sidebar** — host card (GlassPanel), capacity card com `ProgressBar` + social proof
6. **Persistent CTA** — mobile: barra fixed bottom; desktop: floating pill + botão mint glow
7. `Footer`

---

## Fases de Implementação

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

## Desafios Técnicos e Soluções

### `backdrop-filter` Safari
**Problema:** Sem `-webkit-backdrop-filter`, glassmorphism quebra no Safari.  
**Solução:** Ambos os prefixos declarados no `.glass-panel` e `.glass-nav` em `index.css`.

### Tokens com hífens como classes Tailwind
**Problema:** `bg-surface-container-low`, `text-on-surface-variant` — nomes longos podem colidir.  
**Solução:** Configurados via `theme.extend.colors`; Tailwind gera as classes automaticamente. Não usar `theme.colors` (substituiria os defaults).

### Horizontal drag scroll no carousel
**Problema:** `addEventListener` manual tem limpeza frágil em React.  
**Solução:** `EventCardCarousel` usa `useRef` + handlers React (`onMouseDown/Move/Up/Leave`) — sem `addEventListener` direto ao DOM.

### `ProgressBar` com mint glow cortado
**Problema:** `box-shadow` é cortado pelo `overflow: hidden` do container pai.  
**Solução:** `overflow-hidden` fica no container externo da track; a barra preenchida usa `shadow-mint-glow` que não precisa sair dos limites.

### Activity Pulse como estilo CSS puro
**Problema:** O `::after` pseudo-element com animação não pode ser feito via props React inline.  
**Solução:** Classes CSS `.activity-pulse` e `.pulse-dot` definidas em `@layer utilities` no `index.css`; o componente React apenas aplica a classe.

### Cards com `lg:col-span-2` no grid de filtro
**Problema:** Quando o filtro mostra apenas "Private" (1 card wide), o grid fica com espaço vazio.  
**Solução:** Avaliar na implementação se o card Private se adapta para `col-span-1` quando isolado.

### Material Symbols `font-variation-settings`
**Problema:** Diferentes ícones precisam de variações FILL/wght diferentes.  
**Solução:** Componente `Icon.tsx` recebe `fill` e `weight` como props e aplica via `style={{ fontVariationSettings }}`.

---

## Convenções de Código

- **Nomes de arquivos:** PascalCase para componentes (`Button.tsx`, `TopNavBar.tsx`)
- **Props:** Interface explícita antes do componente; tipos inline apenas para props triviais
- **Tailwind:** Classes em array `.join(' ')` para legibilidade em componentes com muitas condicionais
- **Responsividade:** Mobile first — classe base para mobile, `md:` e `lg:` para breakpoints maiores
- **Comentários:** Apenas quando o porquê não é óbvio — sem comentários descritivos do que o código faz
- **Sem `any`:** TypeScript estrito; usar tipos genéricos ou `unknown` quando necessário
