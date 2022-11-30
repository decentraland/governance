/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), 'idea', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), 'personnel', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), 'budget', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), 'roadmap', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES (gen_random_uuid(), 'potential_impact', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
  `

  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    DELETE FROM proposal_survey_topics;
  `
  pgm.sql(sql)
}
