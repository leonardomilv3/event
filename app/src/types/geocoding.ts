export interface AddressSuggestion {
  id: string
  /** Linha principal da sugestão: nome do local (venue) ou rua + número */
  label: string
  /** Endereço formatado para o campo `address` do evento */
  address: string
  /** Preenchido só quando o resultado é um local nomeado (bar, teatro, parque...) */
  venueName?: string
  latitude: number
  longitude: number
}
