# ADR-010: TypeScript Estrito com verbatimModuleSyntax

## Status

Accepted

## Context

O projeto define em suas regras (`IMPLEMENTATION_PLAN.md`): "Zero erros de TypeScript antes de avançar cada fase". Com um design system de 50+ tokens e 20 componentes com interfaces de props, a ausência de tipagem estrita permite erros silenciosos — props opcionais tratadas como obrigatórias, tokens passados como strings arbitrárias, valores `any` propagando-se pela hierarquia de componentes.

## Decision

Usar **TypeScript em modo estrito** com as seguintes regras ativas no `tsconfig.json` gerado pelo Vite:

- `strict: true` — habilita `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes` e demais verificações
- `verbatimModuleSyntax: true` — exige `import { type Foo }` para imports de tipo puro, garantindo que o compilador e o bundler tratem corretamente o erasure de tipos

**Convenções derivadas:**
- Zero uso de `any` — usar tipos genéricos ou `unknown` quando o tipo não é conhecido
- Interfaces de props explícitas antes de cada componente — não usar tipos inline para props
- Imports de tipo obrigatoriamente com `type` keyword: `import { type ButtonHTMLAttributes } from 'react'`

O comando `npx tsc --noEmit` é executado como validação obrigatória antes de qualquer avanço de fase e antes de merge.

## Consequences

**Positivas:**
- Props incorretas de componentes são detectadas em tempo de compilação
- `verbatimModuleSyntax` evita importações de runtime desnecessárias de tipos — build mais eficiente
- Interfaces de props servem como documentação inline — um agente de IA lendo o arquivo entende o contrato do componente sem precisar inspecionar o JSX
- Refatorações seguras: renomear uma prop atualiza todos os usos via TypeScript Language Server

**Negativas:**
- Overhead de escrita: cada componente requer uma interface explícita mesmo quando as props são triviais
- `verbatimModuleSyntax` gera erros de compilação quando imports de tipo são escritos sem `type` keyword — requer atenção em cada import do React (`ButtonHTMLAttributes`, `HTMLAttributes`, etc.)
- Tipos de terceiros podem ser imprecisos ou ausentes, exigindo declarações manuais em `src/types/`

## Alternatives Considered

- **TypeScript sem strict mode** — permite `any` implícito e tipos nullable não verificados; descartado pela regra explícita do projeto
- **JSDoc types** — tipagem sem compilador TypeScript; sem IntelliSense pleno e sem verificação em build
- **`skipLibCheck: true` sem strict** — ignora erros em `node_modules` mas mantém verificação no código próprio; menos seguro que strict completo
