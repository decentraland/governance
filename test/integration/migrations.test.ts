import database from 'decentraland-gatsby/dist/entities/Database/database'
import { MigrationBuilder } from 'node-pg-migrate'

import { ProposalStatus } from '../../src/entities/Proposal/types'
import { up as lowercaseVestingAddresses } from '../../src/migrations/1795621055921_lowercase-uppercase-prefixed-vesting-addresses'
import { EventType } from '../../src/shared/types/events'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'
import { insertProposal, readProposalVestingAddresses } from '../setup/factories'

// Asserts the schema the migrations actually produce. CI runs them from an empty database, so these
// catch a migration that only works from one starting state (the updates table was created under a
// different name historically, and the milestone foreign key has to follow it).
describe('migrations', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  describe('when the updates table rename has run', () => {
    let legacyTableIsGone: boolean
    let currentTableExists: boolean

    beforeEach(async () => {
      const rows = await database.query(`
        SELECT to_regclass('proposal_updates') IS NULL AS legacy_is_gone,
               to_regclass('project_updates') IS NOT NULL AS current_exists
      `)
      legacyTableIsGone = rows[0].legacy_is_gone
      currentTableExists = rows[0].current_exists
    })

    it('should leave no proposal_updates table behind', () => {
      expect(legacyTableIsGone).toBe(true)
    })

    it('should expose the updates table as project_updates', () => {
      expect(currentTableExists).toBe(true)
    })
  })

  describe('when resolving the project milestone updates foreign key', () => {
    let referencedTable: string | undefined

    beforeEach(async () => {
      const rows = await database.query(`
        SELECT ref.relname AS references_table
        FROM pg_constraint con
                 JOIN pg_class cl ON cl.oid = con.conrelid
                 JOIN pg_class ref ON ref.oid = con.confrelid
        WHERE cl.relname = 'project_milestone_updates'
          AND con.conname = 'update_id_fk'
      `)
      referencedTable = rows[0]?.references_table
    })

    it('should point at the renamed project_updates table', () => {
      expect(referencedTable).toBe('project_updates')
    })
  })

  describe('when reading the event type enum', () => {
    let values: string[]

    beforeEach(async () => {
      const rows = await database.query(`
        SELECT e.enumlabel AS value
        FROM pg_enum e
                 JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'event_type'
      `)
      values = rows.map((row: { value: string }) => row.value)
    })

    it('should contain the types added after the events table was created', () => {
      expect(values).toEqual(expect.arrayContaining([EventType.ProposalFinished, EventType.VestingCreated]))
    })
  })
  // The data fix for two proposals saved with an uppercase "0X" vesting address. Run against rows seeded
  // after the schema is in place, since an empty database has nothing for it to change.
  describe('when lowercasing vesting addresses saved with an uppercase 0X prefix', () => {
    const OTHER = '0x1111111111111111111111111111111111111111'
    const UPPERCASE = '0X4240C3EEA13548418AEA8EFC52E4C2E1B2D42F84'
    const CHECKSUMMED = '0x3dA67699E5938bE3336fe0619B07E05CB1CDEEf7'
    let affected: string
    let untouched: string

    beforeEach(async () => {
      affected = (await insertProposal(ProposalStatus.Enacted, [OTHER, UPPERCASE])).id
      untouched = (await insertProposal(ProposalStatus.Enacted, [CHECKSUMMED])).id
      let statement = ''
      await lowercaseVestingAddresses({ sql: (sql: string) => (statement = sql) } as unknown as MigrationBuilder)
      await database.query(statement)
    })

    afterEach(async () => {
      await cleanTables()
    })

    it('should lowercase every address of an affected proposal, keeping their order', async () => {
      expect(await readProposalVestingAddresses(affected)).toEqual([OTHER, UPPERCASE.toLowerCase()])
    })

    it('should leave the proposals without one as they are', async () => {
      expect(await readProposalVestingAddresses(untouched)).toEqual([CHECKSUMMED])
    })
  })
})
