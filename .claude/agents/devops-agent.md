# DevOps Agent

## Quando usar
- Modificar docker-compose.yml
- Alterar Dockerfiles
- Configurar variáveis de ambiente
- Debugar problemas de containers
- Preparar para deploy em Azure

## Estrutura do projeto

eventing/
├── app/          ← frontend React (porta 3000)
├── api/          ← backend Quarkus (porta 8080)
└── docker-compose.yml


## docker-compose.yml — serviços e portas

| Serviço | Imagem | Porta | Health check |
|---|---|---|---|
| frontend | event-frontend | 3000:80 | — |
| api | event-api | 8080:8080 | GET /q/health/live |
| postgres | postgis/postgis:16-3.4 | 5432:5432 | pg_isready |
| redis | redis:7.2-alpine | 6379:6379 | redis-cli ping |

**NUNCA trocar a imagem do postgres para versão 15** — o volume foi inicializado com PG16 e é incompatível.

## Dockerfile da API (JVM mode)
```dockerfile
FROM maven:3.9-eclipse-temurin-25 AS builder
WORKDIR /app
COPY pom.xml ./
COPY src/ ./src/
RUN mvn package -DskipTests -q

FROM eclipse-temurin:25-jre AS runtime
WORKDIR /app
# curl não vem na base 25; o healthcheck do docker-compose.yml depende dele
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN groupadd -r eventing && useradd -r -g eventing eventing
COPY --from=builder --chown=eventing:eventing /app/target/quarkus-app/lib/ ./lib/
COPY --from=builder --chown=eventing:eventing /app/target/quarkus-app/*.jar ./
COPY --from=builder --chown=eventing:eventing /app/target/quarkus-app/app/ ./app/
COPY --from=builder --chown=eventing:eventing /app/target/quarkus-app/quarkus/ ./quarkus/
USER eventing
EXPOSE 8080
ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 -Duser.timezone=UTC -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
CMD ["sh", "-c", "java $JAVA_OPTS -jar quarkus-run.jar"]
```

**Não usar** `dependency:go-offline` — causa falhas de rede com plugins transitivos.
**Não usar** `eclipse-temurin:21-jdk` como builder — não tem Maven.

## Perfis Quarkus

### %dev (desenvolvimento local sem Docker)
```properties
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/eventing
quarkus.datasource.username=eventing
quarkus.datasource.password=eventing
quarkus.redis.hosts=redis://localhost:6379
```

### %prod (dentro do Docker)
```properties
%prod.quarkus.datasource.jdbc.url=jdbc:postgresql://postgres:5432/eventing
%prod.quarkus.datasource.username=eventing
%prod.quarkus.datasource.password=eventing
%prod.quarkus.redis.hosts=redis://redis:6379
```

## Comandos úteis

### Desenvolvimento local
```bash
# Subir apenas infraestrutura
docker compose up postgres redis -d

# API com hot reload
cd api && ./mvnw quarkus:dev

# Frontend com hot reload
cd app && npm run dev
```

### Docker completo
```bash
# Build e subir tudo
docker compose up --build

# Rebuild apenas a API
docker compose build api && docker compose up -d

# Logs em tempo real
docker compose logs api -f

# Forçar rebuild sem cache (último recurso)
docker compose down
rm -rf api/target/
docker compose build api
docker compose up -d
```

### Debug de banco
```bash
# Conectar ao banco
docker exec -it event-postgres-1 psql -U eventing -d eventing

# Ver migrations aplicadas
SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;

# Recriar banco do zero (perde todos os dados)
docker compose down -v
docker compose up postgres -d
```

### Variáveis de ambiente necessárias
```bash
VITE_API_URL=http://localhost:8080  # frontend
DB_URL=jdbc:postgresql://postgres:5432/eventing  # api prod
DB_USER=eventing
DB_PASSWORD=eventing
REDIS_URL=redis://redis:6379
JWT_PUBLIC_KEY_PATH=/app/keys/publicKey.pem
JWT_PRIVATE_KEY_PATH=/app/keys/privateKey.pem
```

## Java — gerenciamento de versões
- **SEMPRE usar Java 25**: o `pom.xml` usa `release 25` e o Quarkus 3.40 suporta Java 25 (ver `api/docs/adrs/010-java-25-quarkus-3-40.md`)
- Gerenciar com SDKMAN:
```bash
  sdk install java 25-tem   # Temurin 25 (confira os identificadores com `sdk list java`)
  sdk use java 25-tem
```
- Verificar: `java -version` deve mostrar `openjdk version "25..."`
- O repositório não tem `.sdkmanrc`; a versão é definida por `maven.compiler.release` no `api/pom.xml`

## Azure (produção futura)
- Frontend → Azure Static Web Apps
- API → Azure Container Apps
- Banco → Azure Database for PostgreSQL Flexible Server (PG 16)
- Cache → Azure Cache for Redis
- Secrets → Azure Key Vault com Managed Identity
- CDN → Azure Front Door
