#!/bin/bash

# Set default values for parameters
DATABASE_NAME="governance"
DUMP_FILE="development.sql"

# Print usage string if no parameters are provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 USERNAME [DATABASE_NAME] [DUMP_FILE]"
  exit 1
fi

# Set parameter values if provided
USERNAME=$1
if [ $# -ge 2 ]; then
  DATABASE_NAME=$2
fi
if [ $# -ge 3 ]; then
  DUMP_FILE=$3
fi

# Restore dump file
echo "Exporting $DATABASE_NAME to $DUMP_FILE..."
pg_dump -Fp -U $USERNAME -d $DATABASE_NAME > $DUMP_FILE

echo "Done."