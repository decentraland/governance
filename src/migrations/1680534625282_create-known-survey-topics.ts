/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    INSERT INTO survey_topics (id, topic_id) VALUES ('075850f2-3a86-46aa-9250-7024b4478abb', 'idea');
    INSERT INTO survey_topics (id, topic_id) VALUES ('83f9a465-d6c1-45fe-871e-45cab716570a', 'team');
    INSERT INTO survey_topics (id, topic_id) VALUES ('67275dcf-e65a-4153-9522-245299f8a57f', 'budget');
    INSERT INTO survey_topics (id, topic_id) VALUES ('427ed7fd-af65-4697-abf4-8fe87de7c8e9', 'roadmap');
    INSERT INTO survey_topics (id, topic_id) VALUES ('5d05a485-1333-443c-b628-31de86275d03', 'impact');
  `

  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    DELETE FROM survey_topics;
  `
  pgm.sql(sql)
}
