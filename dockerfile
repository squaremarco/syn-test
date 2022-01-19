FROM node:16-alpine

RUN mkdir /app

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY src src
COPY rollup.config.js .
COPY tsconfig*.json ./
RUN npm run build

WORKDIR /app/dist
CMD node index.js
