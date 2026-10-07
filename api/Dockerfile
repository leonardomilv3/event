# ─────────────────────────────────────────────────────────────────────────────
# Eventing API — Dockerfile (JVM mode)
# ─────────────────────────────────────────────────────────────────────────────

# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-25 AS builder
WORKDIR /app

COPY pom.xml ./
COPY src/ ./src/
RUN mvn package -DskipTests -q

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jre AS runtime
WORKDIR /app

# A imagem eclipse-temurin:25-jre não traz curl; o healthcheck do docker-compose.yml depende dele
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r eventing && useradd -r -g eventing eventing

COPY --from=builder --chown=eventing:eventing /app/target/quarkus-app/lib/ ./lib/
COPY --from=builder --chown=eventing:eventing /app/target/quarkus-app/*.jar ./
COPY --from=builder --chown=eventing:eventing /app/target/quarkus-app/app/ ./app/
COPY --from=builder --chown=eventing:eventing /app/target/quarkus-app/quarkus/ ./quarkus/

USER eventing
EXPOSE 8080

ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 \
-Duser.timezone=UTC \
-Djava.util.logging.manager=org.jboss.logmanager.LogManager"

CMD ["sh", "-c", "java $JAVA_OPTS -jar quarkus-run.jar"]