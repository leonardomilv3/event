# Template: Página React — Eventing

Use este template para criar novas páginas em `app/src/pages/`.
Antes de criar, verificar se a rota existe em `docs/routes.md` e adicionar se necessária.

---

## Estrutura da página

```tsx
// src/pages/NomeDaPagina.tsx
// Importar organismos — páginas não importam átomos ou moléculas diretamente
import TopNavBar from '../components/organisms/TopNavBar'
import Footer from '../components/organisms/Footer'
import FAB from '../components/organisms/FAB'
// Importar moléculas apenas se necessário para conteúdo específico da página
// que não se enquadra em um organismo existente

// Dados mockados no topo do arquivo — fora do componente
const SECTION_DATA = [
  { id: '1', title: 'Item', /* ... */ },
]

export default function NomeDaPagina() {
  // Estado de UI local (filtros, scroll, interações)
  // Sem fetch de dados — usar dados mockados até existência de API

  return (
    <div className="min-h-screen bg-background text-on-surface">

      {/* Navegação — escolher o padrão correto para a página */}
      <TopNavBar />                    {/* Landing, EventManagement, EventDetail */}
      {/* ou */}
      {/* <SideNavBar /> */}           {/* Dashboard, EventManagement */}

      <main className="...">

        {/* Hero section — se aplicável */}
        <section className="relative ...">
          {/* ... */}
        </section>

        {/* Conteúdo principal */}
        <section className="py-stack-xl px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          {/* Montar organismos e moléculas */}
        </section>

      </main>

      <Footer />
      <FAB label="Ação Principal" />

      {/* Mobile nav — apenas em páginas autenticadas */}
      {/* <BottomNav /> */}

    </div>
  )
}
```

---

## Padrões de layout por tipo de página

### Página pública (Landing, EventDetail)
```tsx
<div className="min-h-screen bg-background text-on-surface">
  <TopNavBar />
  <main className="pt-0">   {/* pt-0 porque o hero começa no topo */}
    {/* conteúdo */}
  </main>
  <Footer />
  <FAB label="..." />
</div>
```

### Página autenticada com sidebar (Dashboard, EventManagement)
```tsx
<div className="min-h-screen bg-background text-on-surface">
  <TopNavBar authenticated userName="..." />  {/* omitir se só SideNavBar */}
  <SideNavBar topOffset="top-20" />          {/* top-20 quando há TopNavBar acima */}

  <div className="flex min-h-screen pt-20">  {/* pt-20 para compensar TopNavBar fixo */}
    <div className="hidden md:block w-64 flex-shrink-0" />  {/* spacer da sidebar */}
    <main className="flex-1 px-margin-mobile md:px-margin-desktop py-stack-lg">
      {/* conteúdo */}
    </main>
  </div>

  <Footer />
  <FAB mobileOnly label="..." />
  <BottomNav />
</div>
```

---

## Regras obrigatórias

- Página não contém lógica de UI própria — apenas monta organismos
- Dados mockados como constantes no topo do arquivo
- Sem fetch de API — implementar quando API existir
- `max-w-container-max mx-auto` em toda seção de conteúdo
- `py-stack-xl` entre seções principais
- `px-margin-mobile md:px-margin-desktop` em padding lateral

## Após criar a página

- [ ] Adicionar rota em `app/src/App.tsx`
- [ ] Documentar em `docs/routes.md` com layout, organismos e seções
- [ ] `npm run build` sem erros
