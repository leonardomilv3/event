# UI Review Checklist

Use este checklist ao revisar ou implementar qualquer mudança visual.
Foco em fidelidade ao design system Living City Aura e responsividade.

---

## 1. Tokens e cores

- [ ] Nenhum valor hexadecimal hardcoded no JSX ou CSS
- [ ] `primary-container` (`#7be7b4`) para botões, bordas ativas, glows
- [ ] `primary` (`#b3ffd7`) apenas para texto e ícones em destaque (não como cor de ação)
- [ ] `secondary` (`#ffb3b0`) exclusivamente para Live Now, Sold Out, alertas críticos
- [ ] Superfícies: `bg-surface-container` para cards, `bg-surface-container-lowest` para footer/seções escuras
- [ ] Texto: `text-on-surface` principal, `text-on-surface-variant` secundário
- [ ] Bordas sutis: `border-outline-variant`

---

## 2. Tipografia

- [ ] Headlines e hero → `font-serif` (Playfair Display)
- [ ] UI, body, labels → `font-sans` (Inter)
- [ ] Tamanhos via tokens: `text-display-lg`, `text-headline-md`, `text-body-md`, `text-label-caps`
- [ ] Nenhum `text-[72px]` ou tamanho arbitrário
- [ ] `label-caps` em ALL CAPS nos elementos de categoria/tag
- [ ] Títulos responsivos: `text-headline-lg-mobile md:text-headline-lg`

---

## 3. Espaçamento

- [ ] Padding de seção: `py-stack-xl` entre seções principais
- [ ] Padding lateral: `px-margin-mobile md:px-margin-desktop`
- [ ] Gap de grid: `gap-gutter`
- [ ] Espaços internos de card: `p-stack-md` ou `p-stack-lg`
- [ ] Largura máxima: `max-w-container-max mx-auto` em toda seção

---

## 4. Glassmorphism e efeitos

- [ ] Painéis glass via `GlassPanel` — nunca `backdrop-filter` inline
- [ ] Nav bars com `.glass-nav` — já incluído nos organismos `TopNavBar`, `BottomNav`
- [ ] `-webkit-backdrop-filter` presente em `index.css` para Safari
- [ ] Gradiente de hero: `.hero-gradient` (não inline)
- [ ] Overlay de imagem: `.editorial-gradient` (não inline)
- [ ] Sombra mint em botões primários: `shadow-mint-glow` + `hover:shadow-mint-glow-strong`

---

## 5. Animações

- [ ] Activity Pulse (dots flutuantes): componente `ActivityPulse` com classes CSS
- [ ] Pulse inline (ao lado de nome): `PulseDot` com classe `.pulse-dot`
- [ ] Badge LIVE: `animate-pulse-red` via classe Tailwind
- [ ] Live indicator (hero detail): `animate-breath` via classe CSS
- [ ] Hover de card: `group-hover:scale-110` na imagem + `shadow-mint-glow` no container
- [ ] FAB hover: shimmer + tooltip — sem Framer Motion

---

## 6. Responsividade — verificar nos 3 breakpoints

### Mobile (375px)
- [ ] Layout em coluna única
- [ ] `BottomNav` visível e funcional
- [ ] FAB posicionado sem sobreposição de conteúdo
- [ ] Texto `display-lg-mobile` (48px) no hero — não 72px
- [ ] Persistent CTA mobile visível no `EventDetail`

### Tablet (768px)
- [ ] Grid transitando de 1 para 2 colunas onde aplicável
- [ ] `SideNavBar` ainda oculta
- [ ] `TopNavBar` com links desktop visíveis

### Desktop (1440px)
- [ ] Grid de 12 colunas funcional
- [ ] `SideNavBar` visível (64px da borda esquerda)
- [ ] `max-w-container-max` contendo o layout
- [ ] Persistent CTA desktop flutuante no `EventDetail`

---

## 7. Componentes do design system

- [ ] Botões usam `Button` atom com `variant` correto
- [ ] Tags e categorias usam `TagChip` com `active` quando aplicável
- [ ] Ícones usam `Icon` com `name`, `fill`, `weight` corretos
- [ ] Cards de evento usam `EventCard`
- [ ] Progress bars usam `ProgressBar` (não div customizada)
- [ ] Avatares sobrepostos usam `AvatarStack`
