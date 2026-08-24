# syntax=docker/dockerfile:1
# Lab 51 Dockerfile stub — resolve every TODO before publishing a digest.

# ----- build stage -----
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /workspace
# TODO: copy Maven wrapper / pom / src (adjust paths to your backend module)
COPY backend/pom.xml backend/
COPY backend/src backend/src
# TODO: use Maven wrapper if present; cache .m2
RUN apt-get update && apt-get install -y --no-install-recommends maven \
  && mvn -f backend/pom.xml -B -DskipTests package \
  && rm -rf /var/lib/apt/lists/*

# ----- runtime stage -----
FROM eclipse-temurin:21-jre-jammy AS runtime
# TODO: create non-root user and switch to it
# RUN useradd -r -u 10001 crm && mkdir -p /app && chown -R crm:crm /app
WORKDIR /app
# TODO: copy only the fat jar from build stage
COPY --from=build /workspace/backend/target/*.jar /app/app.jar
# USER crm
EXPOSE 8080
# TODO: HEALTHCHECK or rely on k8s probes only (document choice)
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
