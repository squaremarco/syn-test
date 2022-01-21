FROM node:16-alpine as build

RUN mkdir /app

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src src
COPY rollup.config.js .
COPY tsconfig*.json ./
RUN npm run build

FROM node:16-alpine

COPY --from=build /app/dist /app

WORKDIR /app
CMD node index.js
