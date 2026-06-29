FROM node:24-alpine@sha256:5fa278c599dbba0c8f873d8717d50ecbb57c5ae6a53b7ab240c25135e0b65995 as compiler
ARG version_number
ARG heroku_app_name
ARG FRONT_BUILD_NODE_OPTIONS="--max-old-space-size=4096"

RUN apk add --no-cache openssh-client \
 && mkdir ~/.ssh && ssh-keyscan github.com > ~/.ssh/known_hosts

RUN apk add --no-cache --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make automake autoconf libtool python3 \
  util-linux \
  git \
  openssh \
  shadow \
  musl-dev \
  zlib \
  file \
  pkgconf

RUN apk add --no-cache tini

WORKDIR /app
COPY ./package-lock.json                      /app/package-lock.json
COPY ./package.json                           /app/package.json
COPY ./.npmrc                                 /app/.npmrc

RUN git config --global url."https://github.com/".insteadOf "ssh://git@github.com/"

RUN npm ci

COPY ./src                                    /app/src
COPY ./static                                 /app/static
COPY ./entrypoint.sh                          /app/entrypoint.sh
COPY ./tsconfig.json                          /app/tsconfig.json
COPY ./.babelrc.json                          /app/.babelrc.json

RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build
RUN npm prune --production --ignore-scripts

FROM node:24-alpine@sha256:5fa278c599dbba0c8f873d8717d50ecbb57c5ae6a53b7ab240c25135e0b65995
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
COPY --from=compiler /app/static               /app/static
COPY --from=compiler /app/entrypoint.sh        /app/entrypoint.sh

VOLUME [ "/data" ]

ENTRYPOINT ["/sbin/tini", "--", "/app/entrypoint.sh"]
