/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    UPDATE proposal_survey_topics SET proposal_sub_types = '["Accelerator", "Core Unit", "Documentation", "In-World Content", "Platform", "Social Media Content", "Sponsorship"]';
  `

  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    UPDATE proposal_survey_topics SET proposal_sub_types = '["Community", "Content Creator", "Platform Contributor", "Gaming","Accelerator", "Core Unit", "Documentation", "In-World Content", "Platform", "Social Media Content", "Sponsorship"]';
  `

  pgm.sql(sql)
}
