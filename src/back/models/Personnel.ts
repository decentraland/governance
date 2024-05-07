import { Model } from 'decentraland-gatsby/dist/entities/Database/model'

export type PersonnelAttributes = {
  id: string
  project_id: string
  address?: string
  name: string
  role: string
  description: string
  link?: string
  status: PersonnelStatus
  updated_by?: string
  updated_at?: Date
  created_at: Date
}

export enum PersonnelStatus {
  Deleted = 'Deleted',
  Unassigned = 'Unassigned',
  Assigned = 'Assigned',
}

export default class PersonnelModel extends Model<PersonnelAttributes> {
  static tableName = 'personnel'
  static withTimestamps = false
  static primaryKey = 'id'
}
