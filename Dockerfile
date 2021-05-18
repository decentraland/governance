FROM node:12-alpine

RUN apk add --no-cache --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make automake autoconf libtool python \
  shadow \
  musl-dev \
  nasm \
  tiff \
  jpeg \
  zlib \
  zlib-dev \
  file \
  pkgconf

WORKDIR /app
COPY ./package-lock.json /app/package-lock.json
COPY ./package.json      /app/package.json

RUN npm ci

RUN apk del native-deps && rm -rf /var/cache/apk/*

COPY ./lib               /app/lib
COPY ./public            /app/public
COPY ./static            /app/static
COPY ./entrypoint.sh     /app/entrypoint.sh
COPY ./gatsby-browser.js /app/gatsby-browser.js
COPY ./gatsby-config.js  /app/gatsby-config.js
COPY ./gatsby-node.js    /app/gatsby-node.js
COPY ./gatsby-ssr.js     /app/gatsby-ssr.js
COPY ./gatsby-ssr.js     /app/gatsby-ssr.js
COPY ./.env.*            /app/

ENTRYPOINT [ "./entrypoint.sh" ]