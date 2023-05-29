#!/bin/bash

# Set default values for parameters
DATABASE_NAME="governance"
DUMP_FILE="development.dump"

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

# Check if database already exists
if psql -lqt | cut -d \| -f 1 | grep -qw $DATABASE_NAME; then
  echo "Database $DATABASE_NAME already exists. Dropping it..."
  psql -U $USERNAME -c "DROP DATABASE IF EXISTS $DATABASE_NAME;"
fi

# Create new database
echo "Creating new database $DATABASE_NAME..."
psql -U $USERNAME -c "CREATE DATABASE $DATABASE_NAME;"

# Check the dump file format
dump_format=$(file -b --mime-type $DUMP_FILE)

# Restore dump file based on format
if [[ $dump_format == "application/octet-stream" ]]; then
  echo "Restoring $DUMP_FILE to $DATABASE_NAME using pg_restore..."
  pg_restore --verbose --clean --no-acl --no-owner -U $USERNAME -d $DATABASE_NAME $DUMP_FILE
elif [[ $dump_format == "text/plain" ]]; then
  echo "Restoring $DUMP_FILE to $DATABASE_NAME using psql..."
  psql -U $USERNAME -d $DATABASE_NAME -f $DUMP_FILE
else
  echo "Unsupported dump file format: $dump_format"
  exit 1
fi

echo "Done."
