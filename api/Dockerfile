# ─────────────────────────────────────────────────────────────────────────────
# Eventing API — Dockerfile (JVM mode)
# ─────────────────────────────────────────────────────────────────────────────

# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Copiar pom.xml primeiro para aproveitar cache de layers do Docker.
# As dependências só são baixadas novamente se o pom.xml mudar.
COPY pom.xml ./
RUN mvn dependency:go-offline -q

# Copiar fonte e compilar
COPY src/ ./src/
RUN mvn package -DskipTests -q

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
# Quarkus JVM mode gera um runner em target/quarkus-app/
# A estrutura é: quarkus-run.jar + lib/ + app/ + quarkus/
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Usuário não-root por segurança
RUN groupadd -r eventing && useradd -r -g eventing eventing

COPY --from=builder --chown=eventing:eventing /app/target/quarkus-app/lib/ ./lib/
COPY --from=builder --chown=eventing:eventing /app/target/quarkus-app/*.jar ./
COPY --from=builder --chown=eventing:eventing /app/target/quarkus-app/app/ ./app/
COPY --from=builder --chown=eventing:eventing /app/target/quarkus-app/quarkus/ ./quarkus/

USER eventing
EXPOSE 8080

ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 \
-Djava.util.logging.manager=org.jboss.logmanager.LogManager"

CMD ["sh", "-c", "java $JAVA_OPTS -jar quarkus-run.jar"]