/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    INSERT INTO survey_topics (id, topic_id) VALUES (gen_random_uuid(), 'budget');
    INSERT INTO survey_topics (id, topic_id) VALUES (gen_random_uuid(), 'beneficiary');
    INSERT INTO survey_topics (id, topic_id) VALUES (gen_random_uuid(), 'specification');
    INSERT INTO survey_topics (id, topic_id) VALUES (gen_random_uuid(), 'personnel');
    INSERT INTO survey_topics (id, topic_id) VALUES (gen_random_uuid(), 'roadmap');
    INSERT INTO survey_topics (id, topic_id) VALUES (gen_random_uuid(), 'value_proposition');
  `

  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    DELETE FROM survey_topics WHERE topic_id = 'budget';
    DELETE FROM survey_topics WHERE topic_id = 'beneficiary';
    DELETE FROM survey_topics WHERE topic_id = 'specification';
    DELETE FROM survey_topics WHERE topic_id = 'personnel';
    DELETE FROM survey_topics WHERE topic_id = 'roadmap';
    DELETE FROM survey_topics WHERE topic_id = 'value_proposition';
  `
  pgm.sql(sql)
}
