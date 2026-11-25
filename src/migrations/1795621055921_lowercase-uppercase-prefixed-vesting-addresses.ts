import { MigrationBuilder } from 'node-pg-migrate'

import ProposalModel from '../entities/Proposal/model'

// Two enacted proposals had a vesting address saved with an uppercase "0X" prefix
// (a847c6e0-c6d6-11ec-90c9-11bf3c6f4ca1 and 2e207620-ba1d-11ec-8561-b591bf2cf0d0), which ethers reads as an ENS
// name, so the batch vesting lookup could not read them. Lowercasing keeps the same addresses, in the same order.
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
