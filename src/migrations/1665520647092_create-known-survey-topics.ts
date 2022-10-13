/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    INSERT INTO survey_topics (id, topic_id, label) VALUES (gen_random_uuid(), '1','budget');
    INSERT INTO survey_topics (id, topic_id, label) VALUES (gen_random_uuid(), '2','beneficiary');
    INSERT INTO survey_topics (id, topic_id, label) VALUES (gen_random_uuid(), '3','specification');
    INSERT INTO survey_topics (id, topic_id, label) VALUES (gen_random_uuid(), '4','personnel');
    INSERT INTO survey_topics (id, topic_id, label) VALUES (gen_random_uuid(), '5','roadmap');
    INSERT INTO survey_topics (id, topic_id, label) VALUES (gen_random_uuid(), '6','value_proposition');
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
