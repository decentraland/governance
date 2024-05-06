import { Model } from 'decentraland-gatsby/dist/entities/Database/model'

import { ProjectStatus } from '../../entities/Grant/types'

export type ProjectAttributes = {
  id: string
  proposal_id: string
  title: string
  status: ProjectStatus
  links: string[]
  about?: string
  about_updated_by?: string
  about_updated_date?: Date
  created_at: Date
  updated_at: Date
}

export default class ProjectModel extends Model<ProjectAttributes> {
  static tableName = 'projects'
  static withTimestamps = false
  static primaryKey = 'id'
}
