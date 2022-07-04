/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
      UPDATE proposals SET enacting_tx = '0x82b976fe1b11b09e12a7a2f0687f3bd87d03eb72e094ca6092755fc97ec0c382' WHERE id = 'ad7eac90-bac0-11ec-8561-b591bf2cf0d0';
      UPDATE proposals SET enacting_tx = '0xbc43d8e547df55e23a2a30c7274b675ded16dc8f6849ec6a6f1063ce50f6f6b7' WHERE id = 'ed3849d0-d804-11eb-9110-69b867ba991b';
      UPDATE proposals SET enacting_tx = '0x40cb752d5abefea9ef9f3705614c35f633344359af6af278c9ffc890ab47eddb' WHERE id = '25891a40-c84a-11ec-90c9-11bf3c6f4ca1';
      UPDATE proposals SET enacting_tx = '0x4fa2a27db0bccdfb7ac11672e8b458a786921daa9ca6dcecf9ad80104a97ab62' WHERE id = 'd961dc40-54f6-11ec-9c52-0d9746a59174';
      UPDATE proposals SET enacting_tx = '0x035d8c46d1423cfc0ca7b30ccf7194f136f3fe296c5200e86fde66747bcd0d53' WHERE id = '29468410-dc00-11eb-9110-69b867ba991b';
      UPDATE proposals SET enacting_tx = '0x14790738ee100309cd7038d17b289292b2109af7c0d18aa40d9095f9827d3264' WHERE id = 'ba798f30-d382-11eb-b705-3db38bad850a';
      UPDATE proposals SET enacting_tx = '0xf493a2ad834443481c00b1dc8232d7d9f5741c6b6b159124cf5fcb878550f463' WHERE id = 'f79cfc20-41fb-11ec-be0c-afec86cba5e5';
      UPDATE proposals SET enacting_tx = '0xa05e2de34ef9cee592cd248f4f74d3b45c166880c99724949751a0b5781278ee' WHERE id = '20fa0450-9067-11ec-831d-95af4f79cd2a';
      UPDATE proposals SET enacting_tx = '0x4fa2a27db0bccdfb7ac11672e8b458a786921daa9ca6dcecf9ad80104a97ab62' WHERE id = 'cd0db440-5ac4-11ec-9c52-0d9746a59174';
      UPDATE proposals SET enacting_tx = '0x4fa2a27db0bccdfb7ac11672e8b458a786921daa9ca6dcecf9ad80104a97ab62' WHERE id = '0b77dd50-4adf-11ec-be0c-afec86cba5e5';
      UPDATE proposals SET enacting_tx = '0x722a9dc1060061a8a9dcdb674c7f2037293e11984fa388838be7c2f6b0c25b75' WHERE id = '3bd44390-ab9b-11ec-87a7-6d2a41508231';
      UPDATE proposals SET enacting_tx = '0xa05e2de34ef9cee592cd248f4f74d3b45c166880c99724949751a0b5781278ee' WHERE id = '5701b9c0-8d25-11ec-b2d8-691324a163a7';
      UPDATE proposals SET enacting_tx = '0xa05e2de34ef9cee592cd248f4f74d3b45c166880c99724949751a0b5781278ee' WHERE id = '903c4130-8936-11ec-bd91-0316d7e70123';
      UPDATE proposals SET enacting_tx = '0xa05e2de34ef9cee592cd248f4f74d3b45c166880c99724949751a0b5781278ee' WHERE id = '38c72150-9286-11ec-831d-95af4f79cd2a';
  `
  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = `
      UPDATE proposals SET enacting_tx = NULL WHERE id = 'ad7eac90-bac0-11ec-8561-b591bf2cf0d0';
      UPDATE proposals SET enacting_tx = NULL WHERE id = 'ed3849d0-d804-11eb-9110-69b867ba991b';
      UPDATE proposals SET enacting_tx = NULL WHERE id = '25891a40-c84a-11ec-90c9-11bf3c6f4ca1';
      UPDATE proposals SET enacting_tx = NULL WHERE id = 'd961dc40-54f6-11ec-9c52-0d9746a59174';
      UPDATE proposals SET enacting_tx = NULL WHERE id = '29468410-dc00-11eb-9110-69b867ba991b';
      UPDATE proposals SET enacting_tx = NULL WHERE id = 'ba798f30-d382-11eb-b705-3db38bad850a';
      UPDATE proposals SET enacting_tx = NULL WHERE id = 'f79cfc20-41fb-11ec-be0c-afec86cba5e5';
      UPDATE proposals SET enacting_tx = NULL WHERE id = '20fa0450-9067-11ec-831d-95af4f79cd2a';
      UPDATE proposals SET enacting_tx = NULL WHERE id = 'cd0db440-5ac4-11ec-9c52-0d9746a59174';
      UPDATE proposals SET enacting_tx = NULL WHERE id = '0b77dd50-4adf-11ec-be0c-afec86cba5e5';
      UPDATE proposals SET enacting_tx = NULL WHERE id = '3bd44390-ab9b-11ec-87a7-6d2a41508231';
      UPDATE proposals SET enacting_tx = NULL WHERE id = '5701b9c0-8d25-11ec-b2d8-691324a163a7';
      UPDATE proposals SET enacting_tx = NULL WHERE id = '903c4130-8936-11ec-bd91-0316d7e70123';
      UPDATE proposals SET enacting_tx = NULL WHERE id = '38c72150-9286-11ec-831d-95af4f79cd2a';
  `
  pgm.sql(sql)
}
