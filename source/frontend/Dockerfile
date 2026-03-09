FROM node:25-alpine AS build

WORKDIR /app

COPY src ./src
COPY index.html package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts .env .

RUN npm install
RUN npm run build

FROM nginx:1.28-alpine-slim

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
