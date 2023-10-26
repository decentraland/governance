// import { MigrationBuilder } from 'node-pg-migrate'

// import Model from '../entities/User/model'

// export async function up(pgm: MigrationBuilder): Promise<void> {
//   pgm.alterColumn(Model.tableName, 'forum_id', { notNull: false })
//   pgm.alterColumn(Model.tableName, 'forum_verification_date', { notNull: false })

//   pgm.addColumn(Model.tableName, { discord_id: { type: 'BIGINT' } })
//   pgm.addColumn(Model.tableName, { discord_verification_date: { type: 'TIMESTAMP' } })

//   pgm.addConstraint(Model.tableName, 'discord_id_unique', { unique: 'discord_id' })
//   pgm.addConstraint(Model.tableName, 'discord_id_check', { check: 'discord_id > 0' })
// }

// export async function down(pgm: MigrationBuilder): Promise<void> {

//   pgm.dropColumn(Model.tableName, 'discord_verification_date')
//   pgm.dropColumn(Model.tableName, 'discord_id')

//   pgm.alterColumn(Model.tableName, 'forum_verification_date', { notNull: true })
//   pgm.alterColumn(Model.tableName, 'forum_id', { notNull: true })
// }
