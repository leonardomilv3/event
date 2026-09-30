# ADR-008: Infraestrutura Managed para o MVP

## Status
Accepted

## Contexto
O MVP precisa de um ambiente de produção funcional com custo zero ou próximo de zero. A equipe é pequena e não tem capacidade operacional para manter VMs, clusters Kubernetes ou servidores próprios.

## Decisão
Usar exclusivamente serviços managed:

| Componente | Plataforma | Justificativa |
|---|---|---|
| Frontend | Vercel | Deploy automático via GitHub push; CDN global; free tier suficiente |
| Backend API | Render | Container Docker a partir do Docker Hub; free tier com spin-up frio aceitável no MVP |
| PostgreSQL + PostGIS | Supabase | Managed PostgreSQL 16; extensão PostGIS disponível; connection pooling nativo |
| Redis | Upstash | Serverless Redis com TLS; cobrança por request (custo ~zero no MVP) |

## CI/CD
GitHub Actions faz build do JAR, empacota imagem Docker e faz push para Docker Hub. Render recebe webhook de deploy após o push. Não há etapa de teste de integração no pipeline — testes de integração requerem PostgreSQL e foram excluídos do CI com `-Dmaven.test.skip=true`.

## Consequências
- **Positivo**: zero custo operacional, zero configuração de infra, deploy em minutos
- **Negativo**: cold start no Render (~30s) afeta primeira request após inatividade
- **Neutro**: Supabase e Upstash têm limites de free tier; migração para planos pagos é direta
- **Decisão futura**: se o produto escalar, avaliar migração do backend para Fly.io ou Railway (sem cold start) antes de considerar VMs próprias
