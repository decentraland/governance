/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    INSERT INTO proposal_survey_topics (topic_id, proposal_type, proposal_sub_types) VALUES ('1', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (topic_id, proposal_type, proposal_sub_types) VALUES ('2', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (topic_id, proposal_type, proposal_sub_types) VALUES ('3', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (topic_id, proposal_type, proposal_sub_types) VALUES ('4', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (topic_id, proposal_type, proposal_sub_types) VALUES ('5', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
    INSERT INTO proposal_survey_topics (topic_id, proposal_type, proposal_sub_types) VALUES ('6', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming"]');
  `

  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    DELETE FROM proposal_survey_topics;
  `
  pgm.sql(sql)
}
