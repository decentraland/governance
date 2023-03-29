#!/bin/bash

# Define default values
DEFAULT_DATABASE_NAME="governance"
DATE="2022-12-01T00:00:00+00:00"

# Get the database name from the first parameter, or use the default if not provided
DATABASE_NAME=${1:-$DEFAULT_DATABASE_NAME}

# Run queries on the database
psql -d $DATABASE_NAME << EOF
SELECT count(*) FROM "public".proposals where created_at <  '$DATE';

DELETE FROM "public".proposal_updates WHERE proposal_id IN (
  SELECT p.id FROM "public".proposals p WHERE p.created_at < '$DATE'
);

DELETE FROM "public".coauthors WHERE proposal_id IN (
  SELECT p.id FROM "public".proposals p WHERE p.created_at < '$DATE'
);

DELETE FROM "public".proposal_subscriptions WHERE proposal_id IN (
  SELECT p.id FROM "public".proposals p WHERE p.created_at < '$DATE'
);

DELETE FROM "public".jobs WHERE run_at < '$DATE';

DELETE FROM "public".proposals WHERE created_at < '$DATE';

SELECT count(*) FROM "public".proposals;
EOF
