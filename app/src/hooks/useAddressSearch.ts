import { useCallback, useEffect, useState } from 'react'
import { type AddressSuggestion } from '../types/geocoding'
import { searchAddress } from '../services/geocodingService'

const MIN_QUERY_LENGTH = 3
// Photon público é fair use — debounce evita uma requisição por tecla
const DEBOUNCE_MS = 350

export interface AddressSearchState {
  query: string
  setQuery: (value: string) => void
  select: (suggestion: AddressSuggestion) => void
  suggestions: AddressSuggestion[]
  loading: boolean
  error: string | null
}

export function useAddressSearch(): AddressSearchState {
  const [query, setQueryState] = useState('')
  // Separado de `query` para que exibir o label selecionado não dispare nova busca
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const term = searchTerm.trim()
    const controller = new AbortController()
    const timer = setTimeout(() => {
      if (term.length < MIN_QUERY_LENGTH) {
        setSuggestions([])
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      searchAddress(term, controller.signal)
        .then(setSuggestions)
        .catch(() => {
          if (controller.signal.aborted) return
          setSuggestions([])
          setError('Busca de endereço indisponível. Preencha os campos manualmente.')
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [searchTerm])

  const setQuery = useCallback((value: string) => {
    setQueryState(value)
    setSearchTerm(value)
  }, [])

  const select = useCallback((suggestion: AddressSuggestion) => {
    setQueryState(suggestion.label)
    setSearchTerm('')
  }, [])

  return { query, setQuery, select, suggestions, loading, error }
}
