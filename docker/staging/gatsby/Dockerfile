FROM node:12-alpine as builder

RUN apk add --no-cache openssh-client \
 && mkdir ~/.ssh && ssh-keyscan github.com > ~/.ssh/known_hosts

RUN apk add --no-cache --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make automake autoconf libtool python3 \
  util-linux \
  git \
  openssh \
  shadow \
  musl-dev \
  nasm \
  tiff \
  jpeg \
  zlib \
  zlib-dev \
  vips \
  vips-dev \
  file \
  pkgconf

WORKDIR /app
COPY ./package-lock.json /app/package-lock.json
COPY ./package.json      /app/package.json
COPY ./gatsby-browser.js /app/gatsby-browser.js
COPY ./gatsby-config.js  /app/gatsby-config.js
COPY ./gatsby-node.js    /app/gatsby-node.js
COPY ./gatsby-ssr.js     /app/gatsby-ssr.js
COPY ./src               /app/src
COPY ./.env.*            /app/

RUN git config --global url."https://github.com/".insteadOf "ssh://git@github.com/"
RUN NODE_ENV=staging npm ci
RUN npm run build:staging

FROM nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/public .

ENTRYPOINT ["nginx", "-g", "daemon off;"]