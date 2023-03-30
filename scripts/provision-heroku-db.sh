#!/bin/bash

# Define default values
DEFAULT_DUMP_FILE="dcl-governance::b006"

# Get the app name from the first parameter
APP_NAME=$1

# Get the dump file parameter from the second parameter, or use the default if not provided
DB_DUMP=${2:-$DEFAULT_DUMP_FILE}

# Get the output of the heroku pg:info command
PG_INFO=$(heroku pg:info -a $APP_NAME)

# Extract the database name from the output
DATABASE=$(echo "$PG_INFO" | sed -n 's/^=== \([^,]*\).*$/\1/p')

# Restore the Heroku Postgres backup
heroku pg:backups:restore $DB_DUMP $DATABASE --app $APP_NAME --confirm $APP_NAME

# Promote the restored database
heroku pg:promote $DATABASE -a $APP_NAME

# Get the connection string for the restored database
CONNECTION_STRING=$(heroku config:get DATABASE_URL -a $APP_NAME)

# Set the connection string as an environment variable
heroku config:set CONNECTION_STRING=$CONNECTION_STRING -a $APP_NAME

# Restart app dynos
heroku ps:restart -a $APP_NAME

echo "Database initialized for https://$APP_NAME.herokuapp.com/"