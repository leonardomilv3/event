# Design System

Baseado no tema **Living City Aura** exportado pelo Stitch.
Todos os tokens estão configurados em `app/tailwind.config.ts` via `theme.extend`.

---

## Paleta de cores

### Superfícies (do mais escuro ao mais claro)

| Token | Valor | Uso |
|---|---|---|
| `surface-container-lowest` | `#0c0e0f` | Seções de fundo mais escuras, footer |
| `background` / `surface` / `surface-dim` | `#121415` | Base de todas as páginas |
| `surface-container-low` | `#1a1c1d` | Hover states sutis |
| `surface-container` | `#1e2021` | Cards, painéis, sidebar |
| `surface-container-high` | `#282a2b` | Elementos elevados |
| `surface-container-highest` / `surface-variant` | `#333536` | Elementos interativos |
| `surface-bright` | `#38393a` | Superfícies em destaque |

### Primária — Mint Green

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#b3ffd7` | Texto e ícones em destaque (Mint claro) |
| `primary-container` | `#7be7b4` | **Botões, bordas ativas, glows** — uso principal |
| `primary-fixed-dim` / `surface-tint` | `#6fdba9` | Variante dim |
| `on-primary-fixed` | `#002113` | Texto sobre botões primários |

### Secundária — Live Red

| Token | Valor | Uso |
|---|---|---|
| `secondary` | `#ffb3b0` | **Uso restrito:** Live Now, Sold Out, alertas críticos |
| `secondary-container` | `#901822` | Background de badges Live |

### Neutros de texto

| Token | Valor | Uso |
|---|---|---|
| `on-surface` | `#e2e2e3` | Texto principal |
| `on-surface-variant` | `#bdcac0` | Texto secundário, metadados |
| `outline` | `#87948b` | Bordas médias |
| `outline-variant` | `#3e4942` | Bordas sutis |
| `on-tertiary-fixed-variant` | `#43474b` | Texto de rodapé, links secundários |

---

## Glassmorphism

Dois utilitários CSS definidos em `@layer components` no `index.css`:

```css
.glass-panel {
  background: rgba(19, 22, 24, 0.6);
  -webkit-backdrop-filter: blur(20px);  /* Safari */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-nav {
  background: rgba(19, 22, 24, 0.6);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
```

Usar `GlassPanel` (componente molecule) como wrapper — não replicar as classes manualmente.

---

## Mint Glow

Sombras configuradas em `tailwind.config.ts` como `boxShadow`:

| Classe | Valor | Uso |
|---|---|---|
| `shadow-mint-glow` | `0 0 20px rgba(123,231,180,0.3)` | Estado padrão de elementos ativos |
| `shadow-mint-glow-strong` | `0 0 30px rgba(123,231,180,0.5)` | Hover em botões primários |
| `shadow-mint-glow-xl` | `0 10px 40px rgba(123,231,180,0.3)` | FAB e CTAs flutuantes |
| `shadow-nav-glow` | `0 0 20px rgba(123,231,180,0.1)` | Borda inferior do TopNavBar |

---

## Gradientes

Classes CSS em `@layer components` no `index.css`:

```css
/* Fundo radial do hero — halo mint sutil */
.hero-gradient {
  background: radial-gradient(circle at 50% 50%, rgba(111,219,169,0.08) 0%, transparent 60%);
}

/* Overlay sobre imagens de hero — escurece de baixo para cima */
.editorial-gradient {
  background: linear-gradient(180deg, rgba(13,15,16,0) 0%, rgba(13,15,16,0.8) 70%, rgba(13,15,16,1) 100%);
}
```

---

## Tipografia

Duas famílias com papéis opostos e complementares.

### Playfair Display — voz editorial

| Token | Size | Line-height | Weight | Uso |
|---|---|---|---|---|
| `display-lg` | 72px | 80px | 700 | Hero desktop |
| `display-lg-mobile` | 48px | 52px | 700 | Hero mobile, números grandes |
| `headline-lg` | 40px | 48px | 600 | Títulos de seção desktop |
| `headline-lg-mobile` | 32px | 38px | 600 | Títulos de seção mobile |
| `headline-md` | 24px | 32px | 500 | Subtítulos, nomes de cards |

Itálico do Playfair Display é carregado (`ital,wght@0,500;..;1,500;..`) — usar `italic` para o deslocamento editorial do hero.

### Inter — workhorse funcional

| Token | Size | Line-height | Weight | Uso |
|---|---|---|---|---|
| `body-lg` | 18px | 28px | 400 | Descrições longas, parágrafos |
| `body-md` | 16px | 24px | 400 | UI geral, corpo de texto |
| `label-md` | 14px | 20px | 500 | Links de nav, metadados |
| `label-caps` | 12px | 16px | 700 | Tags em ALL CAPS (TECHNO, LIVE, DRAFT) — tracking 0.1em |

No Tailwind, usar `font-serif` para Playfair Display e `font-sans` para Inter.

---

## Espaçamento

Base de **8px**. Tokens semânticos configurados em `tailwind.config.ts`:

| Token | Valor | Uso típico |
|---|---|---|
| `stack-xs` | 4px | Gap mínimo (ícone + texto) |
| `stack-sm` | 12px | Agrupamentos compactos |
| `stack-md` | 24px | Padding interno de card, separações próximas |
| `stack-lg` | 48px | Separação entre blocos de conteúdo |
| `stack-xl` | 80px | Espaçamento entre seções principais |
| `gutter` | 24px | Gap entre colunas do grid |
| `margin-mobile` | 20px | Padding lateral mobile |
| `margin-desktop` | 64px | Padding lateral desktop |
| `container-max` | 1440px | Largura máxima de conteúdo |

---

## Border Radius

| Classe | Valor | Uso |
|---|---|---|
| `rounded-md` | 8px | Inputs |
| `rounded-lg` | 12px | Nav items, botões secundários |
| `rounded-xl` | 16px | Cards padrão |
| `rounded-3xl` | 24px | Containers grandes, map section |
| `rounded-full` | 9999px | Botões pill, FAB, avatares |

---

## Animações

Keyframes definidos em `tailwind.config.ts` e classes utilitárias em `index.css`:

| Nome | Classe Tailwind | Efeito | Onde é usado |
|---|---|---|---|
| `pulse-ring` | `animate-pulse-ring` | Ring expandindo 1x→4x, opacity 0.6→0 | `.activity-pulse::after` |
| `breath` | `animate-breath` | Scale 1→3, opacity 0.6→0 | `.pulse-dot::after`, live indicator |
| `pulse-red` | `animate-pulse-red` | Scale + box-shadow pulsante vermelho | Badge LIVE nos cards |

### Activity Pulse (CSS puro)

O `::after` pseudo-element não aceita props React inline. Por isso as classes `.activity-pulse` e `.pulse-dot` vivem em `@layer utilities` no `index.css` — os componentes React apenas aplicam a classe.

---

## Grid e breakpoints

| Breakpoint | Colunas | Gutter | Margem lateral |
|---|---|---|---|
| Mobile `< 768px` | 4 | 16px | 20px (`margin-mobile`) |
| Tablet `768–1023px` | 8 | 20px | 40px |
| Desktop `≥ 1024px` | 12 | 24px | 64px (`margin-desktop`) |

Usar `grid-cols-12` com `lg:col-span-N` para os layouts principais. `max-w-container-max mx-auto` em toda seção de conteúdo.
