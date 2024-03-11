# base node image
FROM node:20-alpine AS base

RUN apk update && apk add --no-cache tzdata
ENV TZ="America/Sao_Paulo"

WORKDIR /web

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

FROM base AS dev

CMD ["npm", "run", "dev"]

FROM base AS prod

RUN npm run build

CMD ["npm", "start"]