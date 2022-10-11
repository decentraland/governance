/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), '1', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), '2', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), '3', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), '4', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), '5', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), '6', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
  `

  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    DELETE FROM proposal_survey_topics;
  `
  pgm.sql(sql)
}
