# Template: Custom Hook React — Eventing

Use este template para criar hooks customizados em `app/src/hooks/`.
Hooks são para lógica reutilizável entre componentes — não criar hook para lógica usada em apenas um lugar.

---

## Hook simples (sem efeitos externos)

```tsx
// src/hooks/useNomeDoHook.ts
import { useState, useCallback } from 'react'

interface UseNomeDoHookOptions {
  // Parâmetros de configuração opcionais
  initialValue?: string
}

interface UseNomeDoHookReturn {
  // Nomear explicitamente o que o hook retorna
  value: string
  setValue: (v: string) => void
  reset: () => void
}

export function useNomeDoHook({ initialValue = '' }: UseNomeDoHookOptions = {}): UseNomeDoHookReturn {
  const [value, setValue] = useState(initialValue)

  const reset = useCallback(() => {
    setValue(initialValue)
  }, [initialValue])

  return { value, setValue, reset }
}
```

---

## Hook com event listener (cleanup obrigatório)

```tsx
// src/hooks/useScrollBehavior.ts
import { useEffect, useState } from 'react'

interface UseScrollBehaviorReturn {
  scrolled: boolean
}

export function useScrollBehavior(threshold = 50): UseScrollBehaviorReturn {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Definir handler fora para poder remover na limpeza
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold)
    }

    // passive: true melhora performance em scroll handlers
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup obrigatório — sem isso, o listener vaza entre renders
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])  // threshold no array de deps pois afeta o handler

  return { scrolled }
}
```

---

## Hook com ref (DOM direto)

```tsx
// src/hooks/useDragScroll.ts
import { useRef, useState, useCallback } from 'react'

interface UseDragScrollReturn {
  ref: React.RefObject<HTMLDivElement>
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onMouseLeave: () => void
  onMouseUp: () => void
  onMouseMove: (e: React.MouseEvent) => void
}

export function useDragScroll(): UseDragScrollReturn {
  const ref = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    setIsDragging(true)
    startX.current = e.pageX - ref.current.offsetLeft
    scrollLeft.current = ref.current.scrollLeft
  }, [])

  const onMouseLeave = useCallback(() => setIsDragging(false), [])
  const onMouseUp = useCallback(() => setIsDragging(false), [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !ref.current) return
    e.preventDefault()
    const x = e.pageX - ref.current.offsetLeft
    ref.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.5
  }, [isDragging])

  return { ref, isDragging, onMouseDown, onMouseLeave, onMouseUp, onMouseMove }
}
```

---

## Regras obrigatórias

- Nome começa com `use` — `useParallax`, `useDragScroll`, `useScrollBehavior`
- Arquivo em `app/src/hooks/` com nome correspondente
- Retornar objeto nomeado, não tupla (exceto quando semântica de `useState` se aplica)
- `useEffect` com event listeners **sempre** tem `return () => removeEventListener(...)`
- Nunca usar `addEventListener` fora de `useEffect`
- `useCallback` para funções passadas como event handlers em loops ou listas
- Zero `any` — tipar eventos com `MouseEvent`, `KeyboardEvent`, etc.
- `import { type RefObject }` para tipos do React

## Quando extrair um hook

- A lógica é usada em 2+ componentes → extrair
- A lógica tem `useEffect` complexo com múltiplas dependências → extrair para clareza
- A lógica envolve `useRef` + eventos → extrair (padrão drag, parallax, scroll)
- A lógica é simples e usada em 1 lugar → manter no componente

## Após criar o hook

- [ ] `npm run build` sem erros
- [ ] Documentar em `docs/architecture.md` se for hook significativo
