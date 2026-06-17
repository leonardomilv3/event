# ADR-002: SmallRye JWT (sem Keycloak no MVP)

## Status
Accepted

## Contexto

Autenticação é necessária desde o dia 1. As opções consideradas foram:

| Opção | Prós | Contras |
|---|---|---|
| Keycloak | Feature-completa, OIDC, SSO | Infraestrutura adicional, complexidade de setup, over-engineering para MVP |
| SmallRye JWT | Nativo no Quarkus, zero infra extra, MicroProfile padrão | Sem refresh token automático, sem OIDC discovery |
| Spring Security | Familiar | Não é o stack deste projeto |

## Decisão

Usamos **SmallRye JWT** com par de chaves RSA (PKCS#8) gerado localmente.

- Assinar tokens: `Jwt.issuer(...).subject(...).upn(...).groups(...).expiresIn(...).sign()` via `quarkus-smallrye-jwt-build`
- Verificar tokens: chave pública em `publicKey.pem` via `mp.jwt.verify.publickey.location`
- Hash de senhas: `BcryptUtil` da extensão `quarkus-elytron-security-common`
- Autorização: `@RolesAllowed("user")` nas rotas protegidas; roles transportadas no claim `groups`
- Lifespan: 86400s (24h) — sem refresh token no MVP

## Consequências

- Par de chaves RSA deve existir em `src/main/resources/` — gerado uma vez, não rotacionado no MVP
- Token expira em 24h; cliente deve fazer login novamente após expiração
- Migração futura para Keycloak/Auth0 é possível sem mudar endpoints — apenas trocar o provedor JWT
