/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    INSERT INTO survey_topics (id, topic_id, title) VALUES (gen_random_uuid(), '1','Budget');
    INSERT INTO survey_topics (id, topic_id, title) VALUES (gen_random_uuid(), '2','Beneficiary');
    INSERT INTO survey_topics (id, topic_id, title) VALUES (gen_random_uuid(), '3','Specification');
    INSERT INTO survey_topics (id, topic_id, title) VALUES (gen_random_uuid(), '4','Personnel');
    INSERT INTO survey_topics (id, topic_id, title) VALUES (gen_random_uuid(), '5','Roadmap');
    INSERT INTO survey_topics (id, topic_id, title) VALUES (gen_random_uuid(), '6','Value Proposition');
  `

  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    DELETE FROM survey_topics WHERE topic_id = '1';
    DELETE FROM survey_topics WHERE topic_id = '2';
    DELETE FROM survey_topics WHERE topic_id = '3';
    DELETE FROM survey_topics WHERE topic_id = '4';
    DELETE FROM survey_topics WHERE topic_id = '5';
    DELETE FROM survey_topics WHERE topic_id = '6';
  `
  pgm.sql(sql)
}
