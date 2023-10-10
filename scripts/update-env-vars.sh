#!/bin/bash

# To run this script:
# - jq for parsing JSON (sudo apt-get install jq or brew install jq)
# - heroku CLI installed and authenticated
# - awk should already be on your system
# Put in the .env.heroku all the variables your want to add or overwrite to the review app

TARGET_APP=$1

if [[ -z "$TARGET_APP" ]]; then
  echo "Missing app name"
  exit 1
fi

EXISTING_VARS=$(heroku config --json --app=${TARGET_APP} | jq -r 'to_entries|map("\(.key)=\(.value)")|.[]')
NEW_VARS=$(awk -F= '/.+/ { print $1"="$2 }' ./.env.heroku)
MERGED_VARS=$(echo -e "${EXISTING_VARS}\n${NEW_VARS}")

# Update env vars for the specified review app
echo "Updating env vars for ${TARGET_APP}..."
heroku config:set --app=${TARGET_APP} ${MERGED_VARS}
echo "Env vars updated for ${TARGET_APP}"

echo "You're good."
