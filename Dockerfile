FROM node:16-alpine
WORKDIR /app

ADD ./package.json ./yarn.lock ./

RUN yarn install --frozen-lockfile

ADD . .

CMD ["yarn", "start"]