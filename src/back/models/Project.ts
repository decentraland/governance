import { Model } from 'decentraland-gatsby/dist/entities/Database/model'

import { ProjectStatus } from '../../entities/Grant/types'

export type Project = {
  id: string
  proposal_id: string
  title: string
  status: ProjectStatus
  links: string[]
  about?: string
  about_updated_by?: string
  about_updated_at?: Date
  updated_at?: Date
  created_at: Date
}

export default class ProjectModel extends Model<Project> {
  static tableName = 'projects'
  static withTimestamps = false
  static primaryKey = 'id'
}
