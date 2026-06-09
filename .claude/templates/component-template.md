# Template: Componente React — Eventing

Use este template para criar átomos, moléculas ou organismos.
Antes de criar, verificar se o componente já existe em `docs/components.md`.

---

## Átomo

Sem dependências internas ao projeto. Mapeia diretamente tokens do design.

```tsx
// src/components/atoms/NomeDoComponente.tsx
import { type HTMLAttributes } from 'react'  // apenas se necessário

interface NomeDoComponenteProps {
  // Props obrigatórias primeiro, opcionais com ? depois
  label: string
  active?: boolean
  className?: string
}

export default function NomeDoComponente({ label, active = false, className = '' }: NomeDoComponenteProps) {
  return (
    <div
      className={[
        // Classes base (mobile first)
        'inline-flex items-center',
        // Classes condicionais em array
        active ? 'bg-primary-container/10 text-primary-container' : 'bg-white/5 text-on-surface-variant',
        className,
      ].join(' ')}
    >
      {label}
    </div>
  )
}
```

---

## Molécula

Composto de 2–4 átomos. Encapsula um padrão de UI recorrente.

```tsx
// src/components/molecules/NomeDaMolecula.tsx
import { type ReactNode } from 'react'
import Icon from '../atoms/Icon'
// Importar apenas de atoms/ — nunca de organisms/ ou pages/

interface NomeDaMoleculaProps {
  title: string
  icon: string
  children?: ReactNode
  className?: string
}

export default function NomeDaMolecula({ title, icon, children, className = '' }: NomeDaMoleculaProps) {
  return (
    <div className={['bg-surface-container rounded-xl p-stack-md', className].join(' ')}>
      <div className="flex items-center gap-stack-sm mb-stack-sm">
        <Icon name={icon} className="text-primary-container" size={20} />
        <h3 className="font-serif text-headline-md text-on-surface">{title}</h3>
      </div>
      {children}
    </div>
  )
}
```

---

## Organismo

Seção completa. Pode ter estado local. Sem lógica de negócio.

```tsx
// src/components/organisms/NomeDoOrganismo.tsx
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
// Importar de molecules/ e atoms/ — nunca de pages/

interface NomeDoOrganismoProps {
  // Props do organismo
  className?: string
}

export default function NomeDoOrganismo({ className = '' }: NomeDoOrganismoProps) {
  const { pathname } = useLocation()  // quando necessário para link ativo
  const [localState, setLocalState] = useState(false)

  // useEffect com cleanup obrigatório quando há event listeners
  useEffect(() => {
    const handler = (e: MouseEvent) => { /* ... */ }
    window.addEventListener('event', handler, { passive: true })
    return () => window.removeEventListener('event', handler)
  }, [])

  return (
    <section className={['...', className].join(' ')}>
      {/* Montar moléculas e átomos */}
    </section>
  )
}
```

---

## Regras obrigatórias

- Interface explícita antes do componente — nunca inline
- `import { type Foo }` para imports de tipo
- `className = ''` como prop com default vazio em todos os componentes
- Classes condicionais em array + `.join(' ')` — nunca template literal
- `export default function` — nunca `export const` arrow function
- PascalCase para o nome do componente e do arquivo
- Zero `any` — usar tipos genéricos ou `unknown`

## Tokens de design obrigatórios

```
Cores de ação:    bg-primary-container    text-primary-container
Texto principal:  text-on-surface
Texto secundário: text-on-surface-variant
Alertas/Live:     text-secondary  (uso restrito)
Cards/painéis:    bg-surface-container
Bordas:           border-outline-variant  border-white/5  border-white/10

Tipografia serif: font-serif text-headline-md / text-display-lg
Tipografia sans:  font-sans text-body-md / text-label-caps

Espaçamento:      p-stack-md  p-stack-lg  gap-gutter
                  px-margin-mobile md:px-margin-desktop
```

## Após criar o componente

- [ ] Adicionar entrada em `docs/components.md` com props e comportamento
- [ ] `npm run build` sem erros
