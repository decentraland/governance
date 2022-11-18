/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    INSERT INTO survey_topics (id, topic_id, label) VALUES (gen_random_uuid(), 'budgt','budget');
    INSERT INTO survey_topics (id, topic_id, label) VALUES (gen_random_uuid(), 'benef','beneficiary');
    INSERT INTO survey_topics (id, topic_id, label) VALUES (gen_random_uuid(), 'spec','specification');
    INSERT INTO survey_topics (id, topic_id, label) VALUES (gen_random_uuid(), 'perso','personnel');
    INSERT INTO survey_topics (id, topic_id, label) VALUES (gen_random_uuid(), 'roadm','roadmap');
    INSERT INTO survey_topics (id, topic_id, label) VALUES (gen_random_uuid(), 'value','value_proposition');
  `

  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    DELETE FROM survey_topics WHERE topic_id = 'budgt';
    DELETE FROM survey_topics WHERE topic_id = 'benef';
    DELETE FROM survey_topics WHERE topic_id = 'spec';
    DELETE FROM survey_topics WHERE topic_id = 'perso';
    DELETE FROM survey_topics WHERE topic_id = 'roadm';
    DELETE FROM survey_topics WHERE topic_id = 'value';
  `
  pgm.sql(sql)
}
