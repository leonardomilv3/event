# Prompts — Substituir dados mockados por dados reais da API
> Stack: React 18 · TypeScript · Vite · Tailwind · Atomic Design  
> Pasta: `app/src/`

---

## Inventário completo de dados mockados

| # | Arquivo | Mock | Substituição |
|---|---|---|---|
| 1 | `EventManagement.tsx` | `userName="Alex Chen"` hardcoded no `<TopNavBar>` e `<SideNavBar>` sem props | `useAuthContext()` → `user.username` |
| 2 | `EventManagement.tsx` | Cards de eventos hardcoded (Neon Pulse, Vanguard, Draft, Alchemist) | `useEventsByCreator()` → eventos reais do usuário |
| 3 | `EventManagement.tsx` | `MOCK_AVATARS` (pravatar) no `<AvatarStack>` do card Live | participantes reais via `useEvent()` |
| 4 | `EventManagement.tsx` | Contagem "12.4k Registrados" e "842" hardcoded | `event.participantCount` real |
| 5 | `UserDashboard.tsx` | `<SideNavBar />` sem props → defaults para "Alex Chen" e "Pro Organizer" | `useAuthContext()` → `user.username` e role |
| 6 | `UserDashboard.tsx` | `STATS` hardcoded (24 eventos, 142 participações, 891 conexões, 4.9 rating) | dados reais da API onde disponível |
| 7 | `UserDashboard.tsx` | `TIMELINE_ITEMS` hardcoded (Midnight Gallery, Luna Ray, Sonic Bloom) | eventos recentes reais via `useMyEvents()` |
| 8 | `UserDashboard.tsx` | `CHART_BARS` hardcoded com alturas fixas | remover ou indicar como "em breve" |
| 9 | `UserDashboard.tsx` | "Rascunho Próximo: Monolith Festival" hardcoded | evento mais recente em DRAFT real |
| 10 | `EventDetail.tsx` | `HOST_IMG` (pravatar) para foto do organizador | `usePublicProfile(event.creatorId)` → `avatarUrl` |
| 11 | `EventDetail.tsx` | `VENUE_IMG` (Unsplash) para foto do local | `event.coverImageUrl` real |
| 12 | `EventDetail.tsx` | `AGENDA` hardcoded (3 itens fixos de lineup) | remover seção ou marcar como "em breve" |
| 13 | `SideNavBar.tsx` | `userName = 'Alex Chen'` e `userRole = 'Pro Organizer'` como defaults | nenhum default — tornar props obrigatórias |
| 14 | `TopNavBar.tsx` | `authenticated` e `userName` como props manuais em cada página | `useAuthContext()` interno no componente |
| 15 | `MyEventsPage.tsx` | `<TopNavBar authenticated userName={user?.username ?? ''}>` passando props redundantes | mesma correção do item 14 |

---

## PROMPT 1 — Conectar `TopNavBar` ao `AuthContext` (eliminar props manuais)

### Agentes a carregar

```
Read .claude/agents/architecture-agent.md
Read .claude/agents/qa-agent.md
```

### Contexto

`TopNavBar` hoje recebe `authenticated` e `userName` como props opcionais.
Cada página que usa o componente passa esses valores manualmente — e em
`EventManagement.tsx` passa `userName="Alex Chen"` hardcoded.

O `AuthContext` já expõe `{ user, isAuthenticated }`. O `TopNavBar` é um organismo
(`organisms/`) — pode usar hooks diretamente conforme a hierarquia Atomic Design.

### Tarefa

**Arquivo:** `app/src/components/organisms/TopNavBar.tsx`

1. Remover as props `authenticated` e `userName` da interface `TopNavBarProps`
2. Importar `useAuthContext` e consumir `user` e `isAuthenticated` internamente:
   ```tsx
   import { useAuthContext } from '../../hooks/useAuthContext'

   export default function TopNavBar() {
     const { user, isAuthenticated } = useAuthContext()
     // ...
     // Substituir `authenticated` por `isAuthenticated`
     // Substituir `userName` por `user?.displayName ?? user?.username`
   }
   ```
3. Manter a lógica de scroll e todos os estilos visuais intactos
4. Adicionar link funcional no pill de usuário para `/dashboard`:
   ```tsx
   import { Link } from 'react-router-dom'
   // ...
   {isAuthenticated && user ? (
     <Link to="/dashboard" className="flex items-center gap-2 px-3 py-1.5 ...">
       <Icon name="account_circle" ... />
       <span ...>{user.displayName ?? user.username}</span>
     </Link>
   ) : (
     <Link to="/login" ...>
       <Icon name="account_circle" ... />
     </Link>
   )}
   ```

**Atualizar todos os chamadores** — remover props que não existem mais:

- `EventManagement.tsx` linha 34: `<TopNavBar authenticated userName="Alex Chen" />` → `<TopNavBar />`
- `MyEventsPage.tsx`: `<TopNavBar authenticated userName={user?.username ?? ''} />` → `<TopNavBar />`
- `LandingPage.tsx`: `<TopNavBar />` → sem mudança (já sem props, mas verificar)
- Verificar todos os outros arquivos com `grep -rn "TopNavBar" app/src/`

**Verificação:**
- `cd app && npm run build` sem erros TypeScript
- Com usuário logado → TopNavBar exibe `displayName ?? username` do banco
- Sem usuário → TopNavBar exibe ícone de perfil sem nome
- Checar lista `qa-agent`: zero `any`, zero listeners sem cleanup

---

## PROMPT 2 — Conectar `SideNavBar` ao `AuthContext` (eliminar defaults "Alex Chen")

### Agentes a carregar

```
Read .claude/agents/architecture-agent.md
Read .claude/agents/qa-agent.md
```

### Contexto

`SideNavBar` tem `userName = 'Alex Chen'` e `userRole = 'Pro Organizer'` como
default props. Qualquer página que renderiza `<SideNavBar />` sem passar props
mostra dados falsos — é o caso de `UserDashboard.tsx`.

### Tarefa

**Arquivo:** `app/src/components/organisms/SideNavBar.tsx`

1. Remover os defaults hardcoded das props:
   ```tsx
   // ANTES
   export default function SideNavBar({
     userName = 'Alex Chen',
     userRole = 'Pro Organizer',
     userAvatar,
     topOffset = 'top-0',
   }: SideNavBarProps)

   // DEPOIS — consumir AuthContext internamente
   export default function SideNavBar({ topOffset = 'top-0' }: Pick<SideNavBarProps, 'topOffset'>) {
     const { user, logout } = useAuthContext()
     const userName = user?.displayName ?? user?.username ?? ''
     const userRole = user?.role === 'admin' ? 'Admin' : 'Organizer'
     const userAvatar = user?.avatarUrl
   ```

2. Importar `useAuthContext` e `useNavigate`
3. Conectar o botão **Logout** à função real do context:
   ```tsx
   const navigate = useNavigate()
   const handleLogout = () => {
     logout()
     navigate('/login')
   }
   // ...
   <button onClick={handleLogout} ...>
     <Icon name="logout" ... />
     Logout
   </button>
   ```
4. Iniciais do avatar devem usar `userName.slice(0, 2).toUpperCase()` — já estava correto,
   mas garantir que não usa o default hardcoded
5. Remover `SideNavBarProps` a não ser `topOffset` (as demais props são desnecessárias agora)

**Atualizar chamadores:**

- `UserDashboard.tsx`: `<SideNavBar />` → sem mudança (topOffset padrão `top-0`)
- `EventManagement.tsx`: `<SideNavBar topOffset="top-20" />` → sem mudança
- `MyEventsPage.tsx`: verificar e ajustar

**Verificação:**
- `npm run build` sem erros
- Com usuário "Leo" logado → SideNavBar exibe "LE" nas iniciais e "Leo" no nome
- Botão Logout redireciona para `/login` e limpa o estado

---

## PROMPT 3 — Substituir eventos hardcoded em `EventManagement` por dados reais

### Agentes a carregar

```
Read .claude/agents/architecture-agent.md
Read .claude/agents/api-backend-agent.md
Read .claude/agents/qa-agent.md
```

### Contexto

`EventManagement.tsx` renderiza 4 cards hardcoded ("Neon Pulse Warehouse",
"Vanguard Editorial", "Projeto Sem Título 04", "The Alchemist Sessions") com
imagens do Unsplash, contagens falsas e status fixos.

A API expõe `GET /api/events` com filtros, e `useMyEvents` já busca eventos em que
o usuário é **participante** — mas precisamos de um hook para eventos em que o usuário
é **criador**. O `EventRepository` tem `findByCreatorId`.

### Tarefa

**Passo 1 — Criar o serviço no frontend:**

Adicionar em `app/src/services/eventService.ts`:
```ts
export async function getEventsByCreator(
  page = 0,
  size = 20
): Promise<PageResponse<EventResponse>> {
  const q = new URLSearchParams({ page: String(page), size: String(size) })
  return http.get<PageResponse<EventResponse>>(`/api/events/me?${q}`)
}
```

**Aguardar:** verificar se a API tem `GET /api/events/me` ou se precisa filtrar
pelos dados do usuário autenticado. Se o endpoint não existir:
- Opção A: usar `GET /api/users/me/events` (eventos em que é participante — não é o correto)
- Opção B: buscar `user.id` do context e filtrar localmente nos eventos do feed
- **Opção C (recomendada):** buscar `GET /api/events` e filtrar por `creatorId === user.id`

Implementar Opção C enquanto o endpoint dedicado não existe:
```ts
export async function getMyCreatedEvents(
  userId: string,
  page = 0,
  size = 20
): Promise<PageResponse<EventResponse>> {
  // Usando /api/events/nearby ou feed não é ideal — usar endpoint do usuário
  // Por ora, buscar via participação no feed e filtrar no cliente
  // TODO: quando backend expor GET /api/events?creatorId={id}
  const q = new URLSearchParams({ page: String(page), size: String(size) })
  return http.get<PageResponse<EventResponse>>(`/api/users/me/events?${q}`)
}
```

**Passo 2 — Criar hook `useCreatedEvents`:**

`app/src/hooks/useCreatedEvents.ts`:
```tsx
import { useState, useEffect } from 'react'
import { type EventResponse } from '../types/api'
import { getMyEvents } from '../services/userService'
import { ApiError } from '../services/httpClient'

export interface CreatedEventsState {
  events: EventResponse[]
  loading: boolean
  error: string | null
}

export function useCreatedEvents(): CreatedEventsState {
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getMyEvents()
      .then(res => { if (!cancelled) { setEvents(res.content); setError(null) } })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : 'Erro ao carregar eventos')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { events, loading, error }
}
```

**Passo 3 — Refatorar `EventManagement.tsx`:**

1. Importar `useCreatedEvents` e `useAuthContext`
2. Remover as constantes `MOCK_AVATARS` e todos os cards JSX hardcoded
3. Substituir o grid de cards por renderização dinâmica:

```tsx
const { events, loading, error } = useCreatedEvents()

// Filtragem local pelos tabs
const filtered = events.filter(ev => {
  if (activeFilter === 'all') return true
  if (activeFilter === 'draft') return ev.status === 'DRAFT'
  if (activeFilter === 'public') return ev.visibility === 'PUBLIC'
  if (activeFilter === 'private') return ev.visibility === 'INVITE_ONLY'
  if (activeFilter === 'live') return ev.status === 'PUBLISHED' && new Date(ev.startsAt) <= new Date()
  return true
})

// Busca local pelo search
const searched = filtered.filter(ev =>
  ev.title.toLowerCase().includes(search.toLowerCase())
)
```

4. Renderizar cada evento com um card consistente (reutilizar o padrão visual
   existente mas com dados reais):
```tsx
{searched.map(ev => (
  <Link key={ev.id} to={`/events/${ev.id}`} className="group bg-[#181C1F] border border-white/5 rounded-xl overflow-hidden hover:border-primary-container/40 hover:shadow-mint-glow transition-all duration-300 flex flex-col">
    <div className="relative h-48">
      {ev.coverImageUrl ? (
        <img src={ev.coverImageUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full bg-surface-variant/10 flex items-center justify-center">
          <Icon name="image" size={64} className="text-white/5" />
        </div>
      )}
      <StatusBadge status={ev.status} visibility={ev.visibility} />
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <h3 className="font-serif text-headline-md text-on-surface mb-1">{ev.title}</h3>
      <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
        {ev.locationName ?? 'Local a definir'} • {ev.category}
      </p>
      <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
        <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
          <Icon name="groups" size={16} />
          {ev.participantCount} participantes
        </span>
        <span className="font-label-caps text-label-caps text-primary-container">
          {new Date(ev.startsAt).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }).toUpperCase()}
        </span>
      </div>
    </div>
  </Link>
))}
```

5. Criar componente interno `StatusBadge` (função local, não arquivo separado) que
   renderiza o badge correto por `status + visibility`

6. Manter o card "Novo Conceito" (CTA de criar) ao final do grid

7. Adicionar estados de loading e error:
```tsx
{loading && (
  <div className="col-span-full flex justify-center py-stack-xl">
    <Icon name="progress_activity" size={32} className="animate-spin text-primary-container" />
  </div>
)}
{!loading && error && (
  <div className="col-span-full text-center py-stack-xl">
    <p className="text-error font-label-md">{error}</p>
  </div>
)}
{!loading && !error && searched.length === 0 && (
  <div className="col-span-full text-center py-stack-xl">
    <p className="text-on-surface-variant">Nenhum evento encontrado</p>
  </div>
)}
```

**Verificação:**
- `npm run build` sem erros TypeScript e zero `any`
- Com usuário sem eventos → exibe estado vazio
- Com usuário com eventos → exibe cards reais com dados do banco
- Filtros de tab funcionam sobre os dados reais
- Campo de busca filtra por título em tempo real

---

## PROMPT 4 — Corrigir `UserDashboard`: Stats, Timeline e "Rascunho Próximo"

### Agentes a carregar

```
Read .claude/agents/architecture-agent.md
Read .claude/agents/qa-agent.md
```

### Contexto

`UserDashboard.tsx` tem três blocos completamente hardcoded que devem usar dados reais
ou ser removidos honestamente:

**A) `STATS`** — 4 cards com valores fictícios (24 eventos, 142 participações, etc.)  
**B) `TIMELINE_ITEMS`** — 3 itens de atividade fictícios  
**C) `CHART_BARS`** + "Rascunho Próximo: Monolith Festival" — completamente inventados

### Tarefa

**Passo 1 — Stats com dados reais (A):**

Importar `useMyEvents` e `useCreatedEvents`:
```tsx
const { events: myEvents } = useMyEvents()           // eventos em que participa
const { events: createdEvents } = useCreatedEvents() // eventos criados
```

Substituir `STATS` por cálculo real:
```tsx
const stats = [
  {
    label: 'Eventos Criados',
    value: createdEvents.length,
    accent: true,
  },
  {
    label: 'Participações',
    value: myEvents.length,
    accent: false,
  },
  {
    label: 'Conexões',
    value: '—',        // API de social não expõe contagem ainda
    accent: false,
  },
  {
    label: 'Eventos Futuros',
    value: createdEvents.filter(e => new Date(e.startsAt) > new Date()).length,
    accent: true,
  },
]
```

**Passo 2 — Timeline com atividade real (B):**

Substituir `TIMELINE_ITEMS` por eventos reais mais recentes:
```tsx
// Pegar os 3 últimos eventos do usuário (criados ou participando)
const recentActivity = [
  ...createdEvents.map(e => ({ ...e, type: 'CRIADO' })),
  ...myEvents.map(e => ({ ...e, type: 'PARTICIPANDO' })),
]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 3)
```

Renderizar cada item usando `<TimelineItem>` com dados reais:
```tsx
{recentActivity.length === 0 ? (
  <p className="font-label-md text-label-md text-on-surface-variant pl-2">
    Sua atividade aparecerá aqui conforme você cria e participa de eventos.
  </p>
) : (
  recentActivity.map((ev, i) => (
    <TimelineItem
      key={ev.id}
      type={ev.type}
      time={new Date(ev.createdAt).toLocaleDateString('pt-BR')}
      isActive={ev.status === 'PUBLISHED' && new Date(ev.startsAt) <= new Date()}
      content={
        <Link to={`/events/${ev.id}`} className="text-primary-container font-bold hover:underline">
          {ev.title}
        </Link>
      }
    />
  ))
)}
```

**Passo 3 — "Rascunho Próximo" com dado real (C):**

Substituir o card hardcoded "Monolith Festival Concept":
```tsx
const nextDraft = createdEvents.find(e => e.status === 'DRAFT')

// No JSX:
{nextDraft ? (
  <GlassPanel className="p-6 border border-white/5 relative overflow-hidden group">
    <PulseDot className="absolute top-4 right-4" />
    <h3 className="font-serif text-headline-md text-on-surface mb-2">Rascunho</h3>
    <p className="font-sans text-label-md text-on-surface-variant">{nextDraft.title}</p>
    <div className="mt-4 flex items-center justify-between">
      <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Em edição</span>
      <Link
        to={`/events/${nextDraft.id}/edit`}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-primary-container hover:text-on-primary-fixed transition-all"
      >
        <Icon name="arrow_forward" size={18} />
      </Link>
    </div>
  </GlassPanel>
) : null}
```

**Passo 4 — `CHART_BARS` (Growth Pulse):**

O backend não expõe dados de séries temporais. Duas opções:
- **Opção A (recomendada):** substituir por um placeholder honesto:
  ```tsx
  <GlassPanel className="p-6 border border-white/5">
    <h3 className="font-serif text-headline-md text-on-surface mb-2">Growth Pulse</h3>
    <p className="font-sans text-body-md text-on-surface-variant text-center py-8">
      Analytics em breve
    </p>
  </GlassPanel>
  ```
- **Opção B:** remover o card completamente

Remover as constantes `CHART_BARS`, `TIMELINE_ITEMS` e `STATS` do topo do arquivo.

**Verificação:**
- `npm run build` sem erros
- Stats mostram contagens reais de eventos
- Timeline mostra eventos reais (ou mensagem vazia honesta)
- "Rascunho Próximo" aparece apenas se existir um evento em DRAFT

---

## PROMPT 5 — Corrigir `EventDetail`: foto do host e foto do venue

### Agentes a carregar

```
Read .claude/agents/architecture-agent.md
Read .claude/agents/qa-agent.md
```

### Contexto

`EventDetail.tsx` tem dois dados hardcoded de imagem:
- `HOST_IMG = 'https://i.pravatar.cc/160?img=8'` — foto estática para o organizador
- `VENUE_IMG = 'https://images.unsplash.com/...'` — foto estática para o local/mapa

O `event.creatorId` já está disponível. Existe `usePublicProfile` hook e `getPublicProfile`
service que buscam o perfil público do criador (com `avatarUrl`).

### Tarefa

**Passo 1 — Substituir `HOST_IMG` pela foto real do criador:**

Importar e usar `usePublicProfile`:
```tsx
import { usePublicProfile } from '../hooks/usePublicProfile'

// No componente, após obter o event:
const { profile: creatorProfile } = usePublicProfile(event?.creatorId ?? '')
```

No JSX do card do host:
```tsx
{/* ANTES */}
<img src={HOST_IMG} alt={event.creatorUsername} ... />

{/* DEPOIS */}
<img
  src={creatorProfile?.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(event.creatorUsername)}&background=1C4532&color=6EE7B7&size=160`}
  alt={event.creatorUsername}
  className="w-full h-full rounded-full object-cover"
/>
```

**Nota sobre o avatar fallback:** usar `ui-avatars.com` gera iniciais com as cores
do design system em vez de fotos aleatórias de pessoa desconhecida.

**Passo 2 — Substituir `VENUE_IMG` pela foto real do evento:**

O campo `event.coverImageUrl` é a imagem principal do evento — usar ela no lugar
do `VENUE_IMG` também na seção de mapa/venue:
```tsx
{/* Na seção de venue/mapa */}
{event.coverImageUrl && (
  <img
    src={event.coverImageUrl}
    alt={event.locationName ?? 'Local do evento'}
    className="w-full h-full object-cover opacity-60"
  />
)}
```
Se não houver `coverImageUrl`, remover a `<img>` e manter apenas o gradiente de fundo.

**Passo 3 — Remover `AGENDA` hardcoded:**

A API não tem campo de agenda/lineup. Opções:
- **Remover** a seção `<AgendaItem>` completamente enquanto o backend não suporta
- **OU** exibir só se `event.description` tiver conteúdo, usando-a como texto corrido:

```tsx
{event.description && (
  <div>
    <h3 className="font-serif text-headline-md text-on-surface mb-stack-md">Sobre o Evento</h3>
    <p className="font-sans text-body-md text-on-surface-variant leading-relaxed">
      {event.description}
    </p>
  </div>
)}
```

**Passo 4 — Remover constantes `HOST_IMG`, `VENUE_IMG` e `AGENDA`** do topo do arquivo.

**Verificação:**
- `npm run build` sem erros e sem referências às constantes removidas
- Com evento cujo criador tem `avatarUrl` → exibe foto real
- Com evento sem `coverImageUrl` → sem imagem quebrada na seção de venue
- Seção de agenda ausente ou substituída por descrição real

---

## PROMPT 6 — Verificação final e limpeza de referências residuais

### Agentes a carregar

```
Read .claude/agents/qa-agent.md
Read .claude/agents/architecture-agent.md
```

### Instrução

Depois dos prompts 1–5, fazer uma varredura completa para garantir que nenhum dado
mockado sobrou e que o build está limpo.

**Passo 1 — Varredura por resíduos:**
```bash
cd app

# Encontrar qualquer referência restante a dados mockados
grep -rn "Alex Chen" src/
grep -rn "pravatar.cc" src/
grep -rn "Pro Organizer" src/
grep -rn "MOCK_" src/
grep -rn "Neon Pulse\|Vanguard Editorial\|Monolith Festival\|Alchemist Sessions\|Sonic Bloom\|Luna Ray" src/
grep -rn "12\.4k\|842\|Registrados" src/
grep -rn "HOST_IMG\|VENUE_IMG\|AGENDA\b" src/
```

Para cada ocorrência encontrada: avaliar se é dado mockado e remover/substituir.

**Passo 2 — Verificar todos os chamadores de `SideNavBar` e `TopNavBar`:**
```bash
grep -rn "SideNavBar\|TopNavBar" src/pages/ src/components/
```

Confirmar que nenhuma página passa `userName`, `authenticated` ou `userRole`
manualmente — esses dados agora vêm do context.

**Passo 3 — Build e checklist `qa-agent`:**
```bash
npm run lint   # zero erros
npm run build  # zero erros TypeScript
```

Checklist obrigatório do `qa-agent`:
- ✅ Zero `any` explícito ou via cast
- ✅ Todo `useEffect` com listener tem cleanup
- ✅ Nenhuma cor hardcoded (`#`, `rgb`) em `.tsx` (exceto `bg-[#181C1F]` existente — manter)
- ✅ Nenhum `pravatar.cc` em produção (apenas fallback de UI)
- ✅ TopNavBar funciona sem autenticação (não quebra em `/`)
- ✅ SideNavBar sem defaults hardcoded
- ✅ EventManagement renderiza lista vazia com estado honesto

**Passo 4 — Smoke test manual:**

| Cenário | O que verificar |
|---|---|
| Usuário não logado em `/` | TopNavBar sem nome, botão de perfil sem label |
| Login com usuário "Leonardo" | TopNavBar exibe "Leonardo", SideNavBar exibe "LE" e "Leonardo" |
| `/events` sem eventos criados | Grid vazio + card "Novo Conceito" |
| `/events` com 2 eventos criados | 2 cards reais + card "Novo Conceito" |
| `/dashboard` com 0 eventos | Stats mostram 0, Timeline vazia, sem card de Draft |
| `/events/{id}` | Foto do host real (ou iniciais), sem "Midnight Gallery", sem agenda fictícia |