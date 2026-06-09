# ADR-005: Atomic Design como Hierarquia de Componentes

## Status

Accepted

## Context

O projeto tem 20 componentes de UI distribuídos entre elementos simples (botões, ícones) e seções completas de página (navbars, carousels, footers). Sem uma hierarquia clara, componentes tendem a crescer em responsabilidade, importar uns dos outros em ciclos, e se tornar difíceis de testar e reutilizar. O design exportado pelo Stitch já sugere uma estrutura em camadas — elementos base reutilizados em padrões maiores.

## Decision

Organizar componentes em três níveis inspirados no **Atomic Design**: `atoms`, `molecules` e `organisms`, dentro de `src/components/`.

```
atoms      →  sem dependências internas; mapeiam tokens do design (Button, Icon, TagChip)
molecules  →  compostos de 2–4 átomos; encapsulam um padrão recorrente (EventCard, GlassPanel)
organisms  →  seções completas com estado local possível (TopNavBar, SideNavBar, FAB)
pages      →  montam organismos; sem lógica de UI própria
```

**Regra de dependência unidirecional:** `pages → organisms → molecules → atoms`. Nenhum nível importa de um nível acima ou do mesmo nível (exceto organismos que podem importar outros organismos em casos justificados).

Os níveis `templates` e `pages` do Atomic Design original foram colapsados em `pages/` — o projeto não tem templates reutilizáveis entre páginas neste momento.

## Consequences

**Positivas:**
- Localização previsível: dado o nome de um componente, sabe-se exatamente onde encontrá-lo
- Composição explícita: a hierarquia documenta as dependências sem precisar abrir o arquivo
- Reutilização natural: átomos e moléculas são usados em múltiplas páginas sem duplicação
- Facilita code review: mudanças em átomos têm impacto visível em toda a hierarquia

**Negativas:**
- A linha entre molécula e organismo é subjetiva — requer julgamento consistente
- Componentes com estado complexo em nível de átomo precisam "subir" de nível, o que pode exigir refatoração
- `templates` ausentes limitam reutilização de layouts entre páginas no futuro

## Alternatives Considered

- **Feature-based structure** (`src/features/landing/`, `src/features/dashboard/`) — agrupa por domínio, não por tipo. Útil em apps com muitos domínios; prematuro para 4 páginas
- **Flat structure** (todos os componentes em `src/components/`) — sem hierarquia, dificulta encontrar componentes conforme o projeto cresce
- **Colocação por página** (componentes junto às páginas que os usam) — inviabiliza reutilização entre páginas
