FROM node:16-alpine

RUN mkdir /app

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY src src
COPY nodemon.json .
COPY tsconfig*.json ./

CMD npm run dev:nodemon
