/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  // const sql = `
  //     INSERT INTO coauthors (proposal_id, address, status) VALUES ('7a236540-d305-11ec-b521-2f98ffa6ccb0', '0x858343382132b9ab46c857a7d52fdbafc039f784', 'APPROVED');
  //     INSERT INTO coauthors (proposal_id, address, status) VALUES ('7a236540-d305-11ec-b521-2f98ffa6ccb0', '0xe6af22b8fd4a2fdfec9a0b18c6be9683882d70e6', 'APPROVED');
  //     INSERT INTO coauthors (proposal_id, address, status) VALUES ('7a236540-d305-11ec-b521-2f98ffa6ccb0', '0xf0480e7b09edb7229d4f7b3b25ef77429c5754cf', 'APPROVED');
  //     INSERT INTO coauthors (proposal_id, address, status) VALUES ('81af5b00-02e6-11ed-8f44-ef1722f0509f', '0x160EeDDB2C1c085232e948aBFB932A19a67395ae', 'APPROVED');
  //     INSERT INTO coauthors (proposal_id, address, status) VALUES ('81af5b00-02e6-11ed-8f44-ef1722f0509f', '0x4E5A351839117021610315C6182467365c6768d7', 'APPROVED');
  // `
  // pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // const sql = `
  //     DELETE FROM coauthors WHERE proposal_id = '7a236540-d305-11ec-b521-2f98ffa6ccb0' AND address = '0x858343382132b9ab46c857a7d52fdbafc039f784';
  //     DELETE FROM coauthors WHERE proposal_id = '7a236540-d305-11ec-b521-2f98ffa6ccb0' AND address = '0xe6af22b8fd4a2fdfec9a0b18c6be9683882d70e6';
  //     DELETE FROM coauthors WHERE proposal_id = '7a236540-d305-11ec-b521-2f98ffa6ccb0' AND address = '0xf0480e7b09edb7229d4f7b3b25ef77429c5754cf';
  //     DELETE FROM coauthors WHERE proposal_id = '81af5b00-02e6-11ed-8f44-ef1722f0509f' AND address = '0x160EeDDB2C1c085232e948aBFB932A19a67395ae';
  //     DELETE FROM coauthors WHERE proposal_id = '81af5b00-02e6-11ed-8f44-ef1722f0509f' AND address = '0x4E5A351839117021610315C6182467365c6768d7';
  // `
  // pgm.sql(sql)
}
