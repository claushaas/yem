# base node image
FROM node:20-alpine AS base

RUN apk update && apk add --no-cache tzdata
ENV TZ="America/Sao_Paulo"

# Install all node_modules, including dev dependencies
FROM base as deps

RUN mkdir /web
WORKDIR /web

ADD package.json package-lock.json ./
RUN npm ci --production=false

# Setup development node_modules
FROM base as dev

ENV NODE_ENV development

RUN mkdir /web
WORKDIR /web

COPY --from=deps /web/node_modules /web/node_modules
ADD package.json package-lock.json ./

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]


# Setup production node_modules
FROM base as production-deps

ENV NODE_ENV production

RUN mkdir /web
WORKDIR /web

COPY --from=deps /web/node_modules /web/node_modules
ADD package.json package-lock.json ./
RUN npm prune --production

# Build the app
FROM base as build

RUN mkdir /web
WORKDIR /web

COPY --from=deps /web/node_modules /web/node_modules

ADD prisma .

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base as prod

ENV NODE_ENV production

RUN mkdir /web
WORKDIR /web

COPY --from=production-deps /web/node_modules /web/node_modules
COPY --from=build /web/node_modules/.prisma /web/node_modules/.prisma
COPY --from=build /web/server /web/server
COPY --from=build /web/public /web/public
ADD . .

CMD ["npm", "run", "start"]