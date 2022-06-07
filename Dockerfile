FROM node:16-alpine as compiler

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

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

WORKDIR /app
COPY ./package-lock.json /app/package-lock.json
COPY ./package.json      /app/package.json
COPY ./newrelic.js      /app/newrelic.js

RUN git config --global url."https://github.com/".insteadOf "ssh://git@github.com/"

RUN npm ci
RUN npm install --arch=arm64 --platform=linux --libc=musl sharp

RUN apk del native-deps && rm -rf /var/cache/apk/*

COPY ./src                  /app/src
COPY ./static               /app/static
COPY ./.env                 /app/.env.production
COPY ./entrypoint.sh        /app/entrypoint.sh
COPY ./gatsby-browser.js    /app/gatsby-browser.js
COPY ./gatsby-config.js     /app/gatsby-config.js
COPY ./gatsby-node.js       /app/gatsby-node.js
COPY ./gatsby-ssr.js        /app/gatsby-ssr.js
COPY ./tsconfig.json        /app/tsconfig.json

RUN sed -i.temp '/Pulumi\.ts/d' package.json

RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build:server
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build:front
RUN npm prune --production

FROM node:16-alpine
WORKDIR /app

COPY --from=compiler /tini /tini
COPY --from=compiler /app/package.json         /app/package.json
COPY --from=compiler /app/package-lock.json    /app/package-lock.json
COPY --from=compiler /app/node_modules         /app/node_modules
COPY --from=compiler /app/lib                  /app/lib
COPY --from=compiler /app/public               /app/public
COPY --from=compiler /app/static               /app/static
COPY --from=compiler /app/templates            /app/templates
COPY --from=compiler /app/entrypoint.sh        /app/entrypoint.sh

VOLUME [ "/data" ]

ENTRYPOINT [ "./entrypoint.sh" ]
