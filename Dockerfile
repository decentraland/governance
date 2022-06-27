FROM node:16.14-alpine as compiler

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

RUN apk add --no-cache tini

WORKDIR /app
COPY ./package-lock.json /app/package-lock.json
COPY ./package.json      /app/package.json

RUN git config --global url."https://github.com/".insteadOf "ssh://git@github.com/"

RUN npm ci

COPY ./src                  /app/src
COPY ./static               /app/static
COPY ./.env                 /app/.env.production
COPY ./entrypoint.sh        /app/entrypoint.sh
COPY ./gatsby-browser.js    /app/gatsby-browser.js
COPY ./gatsby-config.js     /app/gatsby-config.js
COPY ./gatsby-node.js       /app/gatsby-node.js
COPY ./gatsby-ssr.js        /app/gatsby-ssr.js
COPY ./tsconfig.json        /app/tsconfig.json
COPY ./newrelic.js          /app/newrelic.js

RUN sed -i.temp '/Pulumi\.ts/d' package.json

RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build:server
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build:front
RUN npm prune --production

FROM node:16.14-alpine
WORKDIR /app

RUN rm -rf \
  /usr/local/lib/node_modules/npm/ \
  /usr/local/bin/npm \
  /usr/local/bin/npx \
  /usr/local/bin/corepack \
  /usr/local/bin/yarn \
  /usr/local/bin/yarnpkg \
  /opt/yarn-*

COPY --from=compiler /sbin/tini                /sbin/tini
COPY --from=compiler /app/package.json         /app/package.json
COPY --from=compiler /app/package-lock.json    /app/package-lock.json
COPY --from=compiler /app/node_modules         /app/node_modules
COPY --from=compiler /app/lib                  /app/lib
COPY --from=compiler /app/public               /app/public
COPY --from=compiler /app/static               /app/static
COPY --from=compiler /app/entrypoint.sh        /app/entrypoint.sh
COPY --from=compiler /app/newrelic.js         /app/newrelic.js

VOLUME [ "/data" ]

ENTRYPOINT ["/sbin/tini", "--", "/app/entrypoint.sh"]