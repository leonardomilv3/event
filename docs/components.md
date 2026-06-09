# Componentes

Hierarquia Atomic Design em três níveis. Ver [`architecture.md`](./architecture.md) para a regra de dependência entre níveis.

---

## Átomos

Sem dependências internas ao projeto. Mapeiam diretamente tokens do design system.

### `Button`
`src/components/atoms/Button.tsx`

Botão base com 3 variantes e 3 tamanhos.

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Estilo visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding e font-size |
| `children` | `ReactNode` | — | Conteúdo do botão |

Variantes:
- **primary** — `bg-primary-container`, `shadow-mint-glow`, hover `shadow-mint-glow-strong`
- **secondary** — `border-2 border-primary-container`, transparente
- **ghost** — sem borda, texto `primary-container`, hover `bg-surface-container-low`

---

### `TagChip`
`src/components/atoms/TagChip.tsx`

Tag pill em `label-caps`. Usada para categorias de evento (SHOWS, LIVE, DRAFT).

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `label` | `string` | — | Texto da tag (ALL CAPS aplicado via CSS) |
| `active` | `boolean` | `false` | Mint tint vs. neutro |

---

### `ActivityPulse` + `PulseDot`
`src/components/atoms/ActivityPulse.tsx`

Dois exports do mesmo arquivo:

- **`ActivityPulse`** — `position: absolute`, usa `top`/`left` props em porcentagem. Usar dentro de container `relative`. Representa atividade no mapa ou no hero.
- **`PulseDot`** — `position: relative`, inline em flex rows. Usar ao lado de nome de usuário ou em cards de rascunho.

Ambos usam classes CSS puras (`.activity-pulse`, `.pulse-dot`) com `::after` animado — não aceitam props de cor ou tamanho.

---

### `Icon`
`src/components/atoms/Icon.tsx`

Wrapper do Material Symbols Outlined com controle de variações tipográficas.

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `name` | `string` | — | Nome do ícone (ex: `"add"`, `"notifications"`) |
| `fill` | `0 \| 1` | `0` | 0 = outline, 1 = filled |
| `weight` | `100–700` | `400` | Espessura do traço |
| `size` | `number` | `24` | Font-size em px |

Aplica `fontVariationSettings` via `style` — necessário porque Tailwind não suporta variações de fonte arbitrárias.

---

### `ProgressBar`
`src/components/atoms/ProgressBar.tsx`

Barra de progresso horizontal com mint glow.

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `value` | `number` | — | Percentual 0–100 (clampado internamente) |

Nota: `overflow-hidden` fica no container da track; a barra preenchida usa `shadow-mint-glow` sem ser cortada.

---

## Moléculas

Compostos de átomos. Encapsulam um padrão de UI recorrente.

### `GlassPanel`
`src/components/molecules/GlassPanel.tsx`

Container glassmorphism genérico. Aceita todos os props de `<div>` — usar `className` para customizar padding, border e rounded.

Aplica `.glass-panel` (CSS class) + `rounded-xl` como base.

---

### `EventCard`
`src/components/molecules/EventCard.tsx`

Card de evento para carousel e grids.

| Prop | Tipo | Descrição |
|---|---|---|
| `title` | `string` | Título do evento |
| `category` | `string` | Label da `TagChip` (ex: `"SHOWS"`) |
| `imageUrl` | `string` | URL da imagem full-bleed |
| `href` | `string?` | Se fornecido, envolve em `<Link>` do React Router |

Dimensões fixas: `w-[300px] md:w-[450px] h-[500px]`. Hover: `scale-110` na imagem + mint glow.

---

### `StatCard`
`src/components/molecules/StatCard.tsx`

Card bento do dashboard com label e valor numérico grande.

| Prop | Tipo | Descrição |
|---|---|---|
| `label` | `string` | Label em `label-caps` |
| `value` | `string \| number` | Valor em `display-lg-mobile` |
| `accent` | `boolean?` | `true` = valor em `primary-container` |
| `extra` | `ReactNode?` | Slot para ícone (ex: estrela no Rating) |

---

### `TimelineItem`
`src/components/molecules/TimelineItem.tsx`

Item de timeline com dot indicador e glass panel. Usado dentro de um container com `border-l` e `pl-8`.

| Prop | Tipo | Descrição |
|---|---|---|
| `type` | `string` | Label de tipo (ex: `"LIVE NOW"`, `"CONNECTION"`) |
| `time` | `string` | Tempo relativo (ex: `"20m atrás"`) |
| `content` | `ReactNode` | Corpo do item — aceita JSX |
| `isActive` | `boolean?` | `true` = dot e tipo em `primary-container` |

---

### `AgendaItem`
`src/components/molecules/AgendaItem.tsx`

Item de agenda numerado com hover reveal no número.

| Prop | Tipo | Descrição |
|---|---|---|
| `index` | `number` | Número do item (exibido com `padStart(2, '0')`) |
| `title` | `string` | Título da sessão |
| `time` | `string` | Horário e subtítulo |

O número em `display-lg-mobile` começa `opacity-20` e vai a `opacity-100` no hover do grupo.

---

### `AvatarStack`
`src/components/molecules/AvatarStack.tsx`

Avatares sobrepostos com contador de overflow.

| Prop | Tipo | Descrição |
|---|---|---|
| `avatars` | `{ src: string, alt: string }[]` | Lista de avatares |
| `overflow` | `number?` | Número exibido no último círculo "+N" |
| `size` | `number?` | Tamanho Tailwind (default `8` = 32px) |

---

### `FilterTabs`
`src/components/molecules/FilterTabs.tsx`

Segmented control para filtragem de listas.

| Prop | Tipo | Descrição |
|---|---|---|
| `tabs` | `{ label: string, value: string }[]` | Opções disponíveis |
| `active` | `string` | Valor selecionado |
| `onChange` | `(value: string) => void` | Callback de seleção |

---

### `SearchInput`
`src/components/molecules/SearchInput.tsx`

Input de busca com ícone inline e mint glow no focus. Aceita todos os props de `<input>` exceto `className` (exposto separado).

O glow é aplicado no wrapper via estado `focused` local — não no input diretamente (para incluir o ícone na área iluminada).

---

### `BentoCard`
`src/components/molecules/BentoCard.tsx`

Card informativo para seção "Como Funciona".

| Prop | Tipo | Descrição |
|---|---|---|
| `icon` | `string` | Nome do Material Symbol |
| `title` | `string` | Título em `headline-md` |
| `description` | `string` | Texto em `body-md` |

Hover: ícone `scale-110` + border `primary-container/30`.

---

## Organismos

Seções completas. Podem conter estado local e lógica de interação. Não devem conter lógica de negócio.

### `TopNavBar`
`src/components/organisms/TopNavBar.tsx`

Navegação principal fixa. Scroll behavior: adiciona `bg-surface/90` após 50px de scroll via `useEffect`.

| Prop | Tipo | Descrição |
|---|---|---|
| `authenticated` | `boolean?` | Exibe pill com nome do usuário |
| `userName` | `string?` | Nome exibido no pill autenticado |

Links de navegação hardcoded em `NAV_LINKS` — link ativo determinado por `useLocation().pathname`.

---

### `SideNavBar`
`src/components/organisms/SideNavBar.tsx`

Sidebar fixa, visível apenas no desktop (`hidden md:flex`). Link ativo por `useLocation`.

| Prop | Tipo | Descrição |
|---|---|---|
| `userName` | `string?` | Nome do usuário (default: `"Alex Chen"`) |
| `userRole` | `string?` | Role em `label-caps` (default: `"Pro Organizer"`) |
| `userAvatar` | `string?` | URL da foto; sem URL → iniciais do nome |
| `topOffset` | `string?` | Classe `top-*` (default: `"top-0"`); usar `"top-20"` quando há TopNavBar |

---

### `BottomNav`
`src/components/organisms/BottomNav.tsx`

Navegação mobile fixa (`md:hidden`). Inclui FAB central embutido (elevado com `border-4 border-background -mt-10`).

| Prop | Tipo | Descrição |
|---|---|---|
| `onCreatePress` | `() => void?` | Callback do botão central |

---

### `FAB`
`src/components/organisms/FAB.tsx`

Floating Action Button fixo no canto inferior direito.

| Prop | Tipo | Descrição |
|---|---|---|
| `onClick` | `() => void?` | Ação do botão |
| `label` | `string?` | Texto do tooltip (default: `"Create Event"`) |
| `icon` | `string?` | Material Symbol (default: `"add"`) |
| `mobileOnly` | `boolean?` | Aplica `md:hidden` |

Hover: shimmer branco `translate-y` de baixo para cima + tooltip slide-in à esquerda.

---

### `EventCardCarousel`
`src/components/organisms/EventCardCarousel.tsx`

Carousel horizontal com drag-to-scroll e setas desktop.

| Prop | Tipo | Descrição |
|---|---|---|
| `children` | `ReactNode` | Cards (`EventCard` ou qualquer elemento) |
| `sectionLabel` | `string?` | Label acima do título (ex: `"Current Pulse"`) |
| `sectionTitle` | `string?` | Título da seção em `headline-lg` |

Drag: implementado com `onMouseDown/Move/Up/Leave` do React — sem `addEventListener` direto ao DOM para evitar vazamento de listeners.

---

### `Footer`
`src/components/organisms/Footer.tsx`

Footer compartilhado entre todas as páginas. Links hardcoded em `LINKS`. Sem props.
