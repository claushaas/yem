FROM node:20-alpine AS base

RUN apk update && apk add --no-cache tzdata
ENV TZ="America/Sao_Paulo"

FROM base as deps

ENV NODE_ENV development

WORKDIR /app

COPY package*.json ./

RUN npm ci

FROM base as prod-deps

ENV NODE_ENV production

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
RUN npm prune --production


FROM base AS dev

ENV NODE_ENV development

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]

FROM base AS builder

ENV NODE_ENV production

WORKDIR /app

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npx prisma generate

RUN npm run build

FROM base AS prod

ENV NODE_ENV production

WORKDIR /app

COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/build/client ./build/client
COPY --from=builder /app/build/server ./build/server
COPY --from=builder /app/build/src ./build/src
COPY --from=builder /app/build/app.js ./build/app.js
COPY --from=builder /app/build/server.js ./build/server.js

CMD ["npm", "run", "start"]
