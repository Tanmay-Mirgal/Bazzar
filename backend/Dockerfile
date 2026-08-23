# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS build

# Install Maven directly (avoids maven-wrapper.jar issues)
RUN apk add --no-cache maven

WORKDIR /app

# Copy pom first for dependency caching
COPY pom.xml ./

# Download dependencies (cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy source and build JAR
COPY src ./src
RUN mvn package -DskipTests -B

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy only the fat JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render assigns the PORT env var; Spring reads SERVER_PORT
ENV SERVER_PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "-Dserver.port=${PORT:-8080}", "app.jar"]
