/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES ('1698a0a8-3cf9-4675-80bd-a8921ad1967c', 'idea', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming", "Accelerator", "Core Unit", "Documentation", "In-World Content", "Platform", "Social Media Content", "Sponsorship"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES ('a310d94a-05e6-450b-873a-9deaf1ef3ea9', 'team', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming", "Accelerator", "Core Unit", "Documentation", "In-World Content", "Platform", "Social Media Content", "Sponsorship"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES ('d366739d-e874-4c6b-a546-f383dc257a41', 'budget', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming", "Accelerator", "Core Unit", "Documentation", "In-World Content", "Platform", "Social Media Content", "Sponsorship"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES ('7b8519f6-4d4a-4b47-8a31-e97e244696f5', 'roadmap', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming","Accelerator", "Core Unit", "Documentation", "In-World Content", "Platform", "Social Media Content", "Sponsorship"]');
    INSERT INTO proposal_survey_topics (id, topic_id, proposal_type, proposal_sub_types) VALUES ('70387581-b7ab-453d-81c5-2ecf0c1da64a', 'impact', 'grant', '["Community", "Content Creator", "Platform Contributor", "Gaming", "Accelerator", "Core Unit", "Documentation", "In-World Content", "Platform", "Social Media Content", "Sponsorship"]');
  `

  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = `
    DELETE FROM proposal_survey_topics;
  `
  pgm.sql(sql)
}
