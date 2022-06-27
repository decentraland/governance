#!/bin/sh
# ./node_modules/.bin/node-pg-migrate -m lib/migrations -d CONNECTION_STRING up && NODE_ENV=production node lib/server.js

#!/bin/sh

finish() {
  echo "killing service..."
  kill -SIGTERM "$pid" 2>/dev/null;
}

trap finish SIGINT SIGQUIT SIGTERM

echo "running migrations"
./node_modules/.bin/node-pg-migrate -m lib/migrations -d CONNECTION_STRING up

echo "starting service..."
NODE_ENV=production node lib/server.js &

pid=$!
echo "runnig on $pid"
wait "$pid"