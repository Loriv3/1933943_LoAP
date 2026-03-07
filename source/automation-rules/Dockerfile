FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY automation-rules/pom.xml automation-rules/pom.xml
COPY automation-rules/src automation-rules/src
COPY resources resources

WORKDIR /app/automation-rules
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/automation-rules/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
