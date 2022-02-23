FROM postgres:14 as db

WORKDIR /app

COPY ./db/init.sh   /docker-entrypoint-initdb.d
COPY ./db/seed.sql  ./db/seed.sql