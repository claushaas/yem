FROM --platform=arm64 node:21-alpine3.18

WORKDIR /backend

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]
