/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    INSERT INTO survey_topics (id, topic_id) VALUES (gen_random_uuid(), 'idea');
    INSERT INTO survey_topics (id, topic_id) VALUES (gen_random_uuid(), 'personnel');
    INSERT INTO survey_topics (id, topic_id) VALUES (gen_random_uuid(), 'budget');
    INSERT INTO survey_topics (id, topic_id) VALUES (gen_random_uuid(), 'roadmap');
    INSERT INTO survey_topics (id, topic_id) VALUES (gen_random_uuid(), 'potential_impact');
    INSERT INTO survey_topics (id, topic_id) VALUES (gen_random_uuid(), 'test_topic_1');
    INSERT INTO survey_topics (id, topic_id) VALUES (gen_random_uuid(), 'test_topic_2');
  `

  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    DELETE FROM survey_topics;
  `
  pgm.sql(sql)
}
