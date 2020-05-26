FROM node:14

WORKDIR /usr/src/app


COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY src ./src
COPY tsconfig.json ./
RUN yarn run build

CMD [ "yarn", "start" ]
