# ADR-013: Photon (OpenStreetMap) para autocomplete de endereço

## Status

Accepted

## Context

A localização de um evento era preenchida à mão: nome do local e endereço em texto livre. Latitude/longitude não tinham campo no formulário, então eventos criados pela UI ficavam sem `location` e nunca apareciam em `/api/events/nearby` (PostGIS `ST_DWithin`) nem pontuavam por distância no feed.

Precisávamos de autocomplete que resolvesse coordenadas a partir do endereço digitado, sem adicionar segredos novos a gerenciar no Render/Vercel na fase de MVP (ADR-008) e mantendo fallback manual.

## Decision

Usamos a **API pública do Photon** (`https://photon.komoot.io/api/`), geocoder do komoot sobre dados do OpenStreetMap, chamada **direto do browser** — sem chave, sem proxy no backend.

- `app/src/services/geocodingService.ts` — `searchAddress(query, signal)`: restringe ao Brasil (`bbox` + filtro `countrycode === 'BR'`), mapeia GeoJSON → `AddressSuggestion` (`types/geocoding.ts`), deduplica e limita a 6 sugestões. Resultado com nome próprio fora de `highway`/`place`/`boundary`/`building` é tratado como venue e preenche `locationName`.
- `app/src/hooks/useAddressSearch.ts` — debounce de 350 ms, mínimo 3 caracteres, `AbortController` por busca; erro de rede vira mensagem pedindo preenchimento manual.
- `app/src/components/molecules/AddressAutocomplete.tsx` — combobox acessível (setas/Enter/Esc) com atribuição "© OpenStreetMap contributors" (exigida pela licença ODbL).
- `CreateEventPage` / `EditEventPage`: selecionar uma sugestão preenche `locationName` (se venue), `address`, `latitude`, `longitude`. Todos continuam editáveis (fallback manual).

Regra operacional: qualquer outra chamada de geocodificação passa por `geocodingService.ts`; trocar de provedor = trocar só esse arquivo.

## Consequences

**Positivas:**
- Zero custo e zero segredo novo; nada a configurar em Render/Vercel
- Eventos criados pela UI passam a ter coordenadas e entram em busca por proximidade e score do feed
- Provedor isolado num único service — migração para Google Places/Mapbox não toca componentes

**Negativas:**
- Instância pública é *fair use*, sem SLA; indisponibilidade degrada para preenchimento manual
- Cobertura de numeração de endereços no Brasil é inferior ao Google; siglas populares nem sempre resolvem (ex: "MASP" não encontra o museu, "Av. Paulista 1578" encontra)
- Restrito ao Brasil — eventos no exterior exigem coordenadas manuais
- A consulta digitada vai do browser do usuário direto para o komoot (terceiro)

## Alternatives Considered

- **Google Places Autocomplete (New)** — melhor qualidade no Brasil, mas exige chave com billing, restrição por referrer em `VITE_*` e custo por sessão. Fica como caminho de upgrade se a qualidade do OSM virar gargalo.
- **Nominatim (servidor público OSM)** — a política de uso proíbe autocomplete client-side e limita a 1 req/s; exigiria servidor próprio.
- **Proxy no backend Quarkus** — permitiria cache em Redis e esconderia o IP do usuário, mas adiciona endpoint e latência sem necessidade enquanto não houver chave a proteger.
