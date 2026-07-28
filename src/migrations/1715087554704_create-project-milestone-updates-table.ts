/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder } from "node-pg-migrate"
import Model from "../models/ProjectMilestoneUpdate"
import ProjectMilestoneModel from "../models/ProjectMilestone"

// Resolve the updates table at migration time: 'project_updates' on a fresh database, still
// 'proposal_updates' on one that has not reached alter-updates-table-name yet. That later rename
// carries the FK along, since Postgres tracks it by OID. DO blocks take no bind parameters.
const addUpdateIdForeignKey = (tableName: string) => `
  DO $$
  DECLARE
    updates_table text := COALESCE(to_regclass('project_updates'), to_regclass('proposal_updates'))::text;
  BEGIN
    IF updates_table IS NULL THEN
      RAISE EXCEPTION 'neither project_updates nor proposal_updates exists; cannot add update_id_fk';
    END IF;
    EXECUTE format(
      'ALTER TABLE %I ADD CONSTRAINT update_id_fk FOREIGN KEY(update_id) REFERENCES %s(id)',
      '${tableName}', updates_table
    );
  END
  $$;
`

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(Model.tableName, {
    id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true,
    },
    update_id: {
      type: 'TEXT',
      notNull: true
    },
    milestone_id: {
      type: 'TEXT',
      notNull: true
    },
    description: {
      type: 'TEXT',
      notNull: true
    },
    tasks: {
      type: 'TEXT[]',
      notNull: true,
      default: '{}'
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP')
    },
  })

  pgm.createIndex(Model.tableName, 'update_id')
  pgm.sql(addUpdateIdForeignKey(Model.tableName))
  pgm.createIndex(Model.tableName, 'milestone_id')
  pgm.addConstraint(Model.tableName, 'milestone_id_fk', `FOREIGN KEY(milestone_id) REFERENCES ${ProjectMilestoneModel.tableName}(id)`)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
}
