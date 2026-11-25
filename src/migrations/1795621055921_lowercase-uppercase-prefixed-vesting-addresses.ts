import { MigrationBuilder } from 'node-pg-migrate'

import ProposalModel from '../entities/Proposal/model'

// Two enacted proposals had a vesting address saved with an uppercase "0X" prefix
// (e5518e9f-81d3-4ce1-b0e7-d60562620b0b and 4eb9ccee-aad5-48e5-bec8-c03a986ce5ed), which ethers reads as an ENS
// name, so their vesting could not be read. Lowercasing keeps the same addresses, in the same order.
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    UPDATE ${ProposalModel.tableName}
    SET vesting_addresses = ARRAY(
      SELECT lower(address)
      FROM unnest(vesting_addresses) WITH ORDINALITY AS vesting(address, position)
      ORDER BY position
    )
    WHERE EXISTS (SELECT 1 FROM unnest(vesting_addresses) AS address WHERE address LIKE '0X%')
  `)
}

// Nothing to undo: the original casing carried no information, the addresses are the same.
export async function down(): Promise<void> {
  return
}
