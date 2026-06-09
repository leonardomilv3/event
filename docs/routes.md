# Rotas e Páginas

Roteamento client-side via React Router v6, configurado em `app/src/App.tsx`.

---

## Tabela de rotas

| Rota | Componente | Layout de navegação | Arquivo |
|---|---|---|---|
| `/` | `LandingPage` | `TopNavBar` + `FAB` + `Footer` | `src/pages/LandingPage.tsx` |
| `/dashboard` | `UserDashboard` | `SideNavBar` (desktop) + `BottomNav` (mobile) + `FAB` | `src/pages/UserDashboard.tsx` |
| `/events` | `EventManagement` | `TopNavBar` + `SideNavBar` + `BottomNav` mobile + `FAB` mobile | `src/pages/EventManagement.tsx` |
| `/events/:id` | `EventDetail` | Nav local inline + persistent CTA + `Footer` | `src/pages/EventDetail.tsx` |
| `*` | Redirect | → `/` | `App.tsx` |

---

## LandingPage `/`

Página pública de descoberta. Não requer autenticação.

**Organismos e ordem de renderização:**

1. `TopNavBar` — fixo, glassmorphism, links de navegação principal
2. **Hero** — `min-h-screen`, fundo `hero-gradient`, 4× `ActivityPulse` dots flutuantes, 2 ambient blobs com `animate-pulse`, headline Playfair Display com deslocamento editorial (`translate-x`/`-translate-y` no desktop), 2 botões (primary pill + secondary outline)
3. **Carousel "Current Pulse"** — `EventCardCarousel` com `sectionLabel` + `sectionTitle`, 5× `EventCard` com drag-to-scroll e setas desktop
4. **Map Section** — `lg:grid-cols-12` (4 cols texto + 8 cols mapa), mapa mock com imagem + 5× `ActivityPulse` + controles de zoom, legenda com dots coloridos
5. **How it Works** — `grid md:grid-cols-3`, 3× `BentoCard` (Descubra / Conecte-se / Participe)
6. `Footer`
7. `FAB` — "Criar Evento", tooltip no hover

**Micro-interações:**
- Parallax suave no `hero-gradient` via `mousemove` (`useEffect` com cleanup)
- Scroll behavior no `TopNavBar` (`bg-surface/90` ao rolar)

---

## UserDashboard `/dashboard`

Área autenticada do criador de eventos.

**Organismos e ordem de renderização:**

1. `SideNavBar` — fixa à esquerda no desktop, logo + user section com iniciais + links com ícones fill/outline por estado ativo
2. `BottomNav` — mobile only, FAB central embutido
3. **Profile Hero** — `h-[400px]`, imagem full-bleed com `editorial-gradient`, avatar quadrado com `glass-panel`, nome + `PulseDot` vermelho, bio, 3× `TagChip` de interesse
4. **Stats Bento** — `grid grid-cols-2 md:grid-cols-4`, 4× `StatCard` (Events Created / Participated / Connections / Rating)
5. **Main Layout** — `lg:grid-cols-12`:
   - **Timeline** (7 cols) — `border-l` vertical + 3× `TimelineItem` (LIVE NOW / CONNECTION / EVENT JOINED)
   - **Insights Sidebar** (5 cols) — gráfico de barras custom (7 barras, `primary-container/20` → `primary-container/60` na barra de pico) + draft card com `PulseDot`
6. `Footer`
7. `FAB` — "Criar Evento"

---

## EventManagement `/events`

Gestão de eventos do organizador. Requer autenticação.

**Organismos e ordem de renderização:**

1. `TopNavBar` — autenticado, exibe nome do usuário
2. `SideNavBar` — `topOffset="top-20"` para não sobrepor o TopNavBar
3. **Page Header** — título "Eventing Hub" + descrição + botão "Criar Evento"
4. **Controls** — `FilterTabs` (Todos / Draft / Público / Privado / Ao Vivo) + `SearchInput` com mint glow no focus
5. **Card Grid** — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, 5 variantes de card:

   | Variante | Badge | Diferencial visual |
   |---|---|---|
   | **Live** | `LIVE` vermelho `animate-pulse-red` | `AvatarStack` + data no rodapé |
   | **Público** | `PÚBLICO` mint outline | Botões Edit/Duplicate + contagem de registrados |
   | **Draft** | `DRAFT` neutro | Placeholder de imagem + botão "Finalizar Configuração" outline |
   | **Privado** | `COLETIVO PRIVADO` | `lg:col-span-2`, layout horizontal imagem (2/5) + texto (3/5) |
   | **Empty CTA** | — | Dashed border, ícone `add_circle`, texto de incentivo |

6. `Footer`
7. `FAB` — mobile only (`mobileOnly` prop)
8. `BottomNav`

---

## EventDetail `/events/:id`

Página de detalhe de um evento. Acesso público com CTA de participação.

**Organismos e ordem de renderização:**

1. **Nav local inline** — usa `useRef` para scroll behavior (glassmorphism + `bg-surface/90` ao rolar); não usa `TopNavBar` para ter controle do `ref` diretamente
2. **Hero cinematográfico** — `h-[870px]`, imagem full-bleed, `editorial-gradient`, live indicator com `animate-breath` (dot vermelho + ring), título `display-lg`, metadados (data, local, `AvatarStack` social proof)
3. **Content Layout** — `lg:grid-cols-12`:
   - **Coluna esquerda** (8 cols):
     - "The Narrative" — dois parágrafos descritivos
     - "The Agenda" — 3× `AgendaItem` numerados (01/02/03) com hover opacity
     - "The Venue" — mapa mock grayscale + card com endereço e botão "Navegar"
   - **Coluna direita / Sidebar** (4 cols):
     - Host card (`GlassPanel`) — avatar, nome, role, bio, botões Follow + Mail
     - Capacity card — label, contagem "14 / 150", `ProgressBar` com mint glow, indicadores de demanda
4. `Footer`
5. **Persistent CTA mobile** — barra `fixed bottom-0`, botão full-width "Participar"
6. **Persistent CTA desktop** — floating `glass-panel` pill "Vagas limitadas restantes" + botão pill mint grande
