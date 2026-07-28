import database from 'decentraland-gatsby/dist/entities/Database/database'

// Dependents first; TRUNCATE ... CASCADE handles the FKs regardless, but this keeps intent clear.
const TABLES_TO_CLEAN = [
  'coauthors',
  'proposal_subscriptions',
  'project_updates',
  'personnel',
  'project_milestones',
  'project_links',
  'projects',
  'proposals',
  'quarter_category_budgets',
  'quarter_budgets',
]

/**
 * Guards against running the destructive helpers below against anything but a local test database:
 *  1. NODE_ENV=test
 *  2. CONNECTION_STRING pointing at localhost / 127.0.0.1
 *  3. database name containing "test" (guards against a port-forwarded production DB)
 */
function assertTestEnvironment(): void {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error("Refused to run: NODE_ENV is not 'test'. Set NODE_ENV=test to use the test database helpers.")
  }

  const connectionString = process.env.CONNECTION_STRING || ''
  const isLocalConnection = connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
  if (!isLocalConnection) {
    throw new Error('Refused to run: CONNECTION_STRING is not a local database (expected localhost or 127.0.0.1).')
  }

  const dbName = extractDatabaseName(connectionString)
  if (!dbName || !dbName.includes('test')) {
    throw new Error(
      `Refused to run: database name "${dbName || ''}" does not contain "test". ` +
        "Use a database name like 'governance_test' to prevent accidental data loss."
    )
  }
}

function extractDatabaseName(connectionString: string): string | null {
  try {
    const dbName = new URL(connectionString).pathname.replace(/^\//, '')
    return dbName || null
  } catch {
    const match = connectionString.match(/dbname=(\S+)/)
    return match?.[1] || null
  }
}

export async function initTestDb(): Promise<void> {
  assertTestEnvironment()
  await database.connect()
}

export async function cleanTables(): Promise<void> {
  assertTestEnvironment()
  for (const table of TABLES_TO_CLEAN) {
    await database.query(`TRUNCATE TABLE ${table} CASCADE`)
  }
}

export async function closeTestDb(): Promise<void> {
  await database.close()
}
