/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
      UPDATE proposals SET vesting_address = '0x8a6dec7bcc3af9a1d1b5507ccbfab6ecc434ac0a' WHERE id = 'a1aa6a50-5c72-11ec-9c52-0d9746a59174';
      UPDATE proposals SET vesting_address = '0xe8a1B5F25b3bF789aFAe04f3F11C0e7d0F527973' WHERE id = '90f57aa0-5908-11ec-9c52-0d9746a59174';
  `
  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = `
      UPDATE proposals SET vesting_address = NULL WHERE id = 'a1aa6a50-5c72-11ec-9c52-0d9746a59174';
      UPDATE proposals SET vesting_address = NULL WHERE id = '90f57aa0-5908-11ec-9c52-0d9746a59174';
  `
  pgm.sql(sql)
}
