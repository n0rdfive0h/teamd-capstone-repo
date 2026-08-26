# syntax=docker/dockerfile:1

# build stage
FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /workspace

COPY backend/pom.xml backend/
COPY backend/src backend/src

RUN apt-get update \
    && apt-get install -y --no-install-recommends maven \
    && mvn -f backend/pom.xml -B -DskipTests package \
    && rm -rf /var/lib/apt/lists/*

# runtime stage
FROM eclipse-temurin:21-jre-jammy AS runtime

RUN useradd --system --uid 10001 --create-home crm

WORKDIR /app

COPY --from=build /workspace/backend/target/*.jar /app/app.jar

RUN chown -R crm:crm /app

USER 10001

EXPOSE 8080

# Kubernetes readiness/liveness probes are the health mechanism.
# No Docker HEALTHCHECK is used because k3s owns container health.

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
