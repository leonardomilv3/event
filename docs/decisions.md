# Decisões Arquiteturais

Registro de decisões tomadas durante o desenvolvimento — tanto as explícitas quanto as implícitas no código.
Para decisões futuras de maior impacto, criar um ADR formal em `docs/adrs/`.

---

## Stack e ferramentas

### Vite em vez de Create React App
CRA está em modo de manutenção desde 2023. Vite oferece HMR instantâneo, build via Rollup e configuração TypeScript nativa sem ejetar.

### Tailwind CSS v3 em vez de v4
Tailwind v4 (alfa em 2024) mudou radicalmente a API de configuração. O design system exportado pelo Stitch usa a API v3 (`tailwind.config.ts` com `theme.extend`). Migrar para v4 exigiria reescrever todos os tokens sem benefício imediato.

### Tailwind via `theme.extend` em vez de `theme`
Usar `theme.colors` substituiria toda a paleta padrão do Tailwind. `theme.extend.colors` adiciona os tokens do design sem perder utilitários como `white`, `black` e `transparent`.

### Drag nativo em vez de Embla Carousel
O carousel da landing usa apenas scroll horizontal com drag — sem paginação, sem snap, sem dots. Implementar com `useRef` + handlers React é suficiente e elimina uma dependência. Embla foi mantido como dependência instalada para uso futuro se o carousel precisar de recursos avançados.

### React Router v6 em vez de TanStack Router
O projeto tem 4 rotas simples sem loaders de dados, layouts aninhados complexos ou type-safe params. React Router v6 atende sem overhead de configuração.

### Sem gerenciador de estado global (Redux, Zustand, Jotai)
Todo estado atual é local ou de UI (filtros, scroll, drag). Não há dados compartilhados entre páginas que justifiquem um store. Adicionar quando houver necessidade real — não por antecipação.

### Sem React Query / SWR
Os dados são todos mockados. A camada de fetch será adicionada quando houver API real. Evitar abstrações prematuras sobre dados que ainda não existem.

---

## Componentes e CSS

### CSS puro para Activity Pulse (não Framer Motion)
O `::after` pseudo-element com `animation` não pode ser controlado por props React ou pelo motion engine do Framer Motion. A solução é definir `.activity-pulse` e `.pulse-dot` em `@layer utilities` no `index.css` — o componente React apenas aplica a classe. Isso é intencional, não uma limitação a ser contornada.

### `-webkit-backdrop-filter` ao lado de `backdrop-filter`
Safari requer o prefixo `-webkit-` para glassmorphism funcionar. Declarado explicitamente em `.glass-panel` e `.glass-nav` no `index.css`. Sem o prefixo, todos os painéis ficam opacos no Safari.

### Tokens com hífens como classes Tailwind
Nomes como `bg-surface-container-low` e `text-on-surface-variant` funcionam normalmente como classes Tailwind quando configurados em `theme.extend.colors`. O Tailwind converte chaves com hífens diretamente em classes. Não há colisão com tokens padrão do Tailwind.

### `overflow-hidden` fora da `ProgressBar`
`box-shadow` é cortado por `overflow: hidden` no elemento pai. A `ProgressBar` usa `overflow-hidden` apenas na track externa (que define o shape da barra), enquanto a barra preenchida aplica `shadow-mint-glow` livremente dentro desse container. Reorganizar quebraria o glow.

### `EventCardCarousel` com handlers React em vez de `addEventListener`
`addEventListener` em `useEffect` sem cleanup correto vaza listeners entre renders. Handlers React (`onMouseDown`, `onMouseMove`, `onMouseUp`, `onMouseLeave`) têm lifecycle gerenciado automaticamente pelo React e são removidos quando o componente desmonta.

### `font-variation-settings` via `style` prop no `Icon`
Tailwind não tem utilitários para `font-variation-settings`. O componente `Icon` aplica `fontVariationSettings: "'FILL' X, 'wght' Y"` via `style` inline — isso é intencional e não deve ser movido para classes.

### Nav local inline no `EventDetail`
`TopNavBar` não expõe `ref` externo. `EventDetail` precisa de controle direto do elemento `<nav>` para o scroll behavior. A solução é um nav inline no próprio componente. Se `TopNavBar` precisar de `forwardRef` no futuro, o nav local pode ser substituído.

---

## Design e tokens

### `primary-container` como cor de ação principal (não `primary`)
`primary` (`#b3ffd7`) é o Mint claro — usado para texto e ícones em destaque.
`primary-container` (`#7be7b4`) é o Mint saturado — usado em botões, bordas ativas e glows.
Esta distinção vem diretamente do Material Design 3 que o Stitch segue. Não trocar os dois.

### `secondary` reservado para Live/alertas
`secondary` (`#ffb3b0`, vermelho suave) representa o "heartbeat da cidade" — eventos ao vivo, sold out, alertas críticos. Não usar como cor de destaque secundário genérico.

### `font-serif` e `font-sans` como aliases
Em vez de repetir `font-['Playfair_Display']` e `font-['Inter']`, o `tailwind.config.ts` define `fontFamily.sans = ['Inter']` e `fontFamily.serif = ['Playfair Display']`. Usar `font-serif` e `font-sans` nas classes.

### Glassmorphism via componente `GlassPanel`, não classes diretas
As classes `.glass-panel` poderiam ser aplicadas diretamente. Encapsular em `GlassPanel` garante que o padrão (incluindo o `rounded-xl` padrão) seja aplicado consistentemente e possa ser atualizado em um único lugar.
