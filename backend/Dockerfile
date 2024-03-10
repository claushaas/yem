FROM node:20-alpine AS base

RUN apk update && apk add --no-cache tzdata
ENV TZ="America/Sao_Paulo"

WORKDIR /backend

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 3001

FROM base AS dev

CMD ["npm", "run", "dev"]

FROM base AS prod

RUN npm run build

CMD ["npm", "start"]