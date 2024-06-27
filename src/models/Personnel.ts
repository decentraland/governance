import { Model } from 'decentraland-gatsby/dist/entities/Database/model'

import { TeamMember } from '../entities/Grant/types'

export type PersonnelAttributes = TeamMember & {
  id: string
  project_id: string
  deleted: boolean
  updated_by?: string
  updated_at?: Date
  created_at: Date
}

export default class PersonnelModel extends Model<PersonnelAttributes> {
  static tableName = 'personnel'
  static withTimestamps = false
  static primaryKey = 'id'
}
