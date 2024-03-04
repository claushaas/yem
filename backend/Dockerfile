FROM --platform=arm64 node:21-alpine3.18

RUN apk update && apk add --no-cache tzdata
ENV TZ="America/Sao_Paulo"

WORKDIR /backend

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]
