/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), 'budgt', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), 'benef', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), 'spec', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), 'perso', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), 'roadm', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), 'value', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
  `

  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    DELETE FROM proposal_survey_topics;
  `
  pgm.sql(sql)
}
