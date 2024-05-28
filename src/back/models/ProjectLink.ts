import { Model } from 'decentraland-gatsby/dist/entities/Database/model'

export type ProjectLink = {
  id: string
  project_id: string
  label: string
  url: string
  updated_by?: string
  updated_at?: Date
  created_by: string
  created_at: Date
}

export default class ProjectLinkModel extends Model<ProjectLink> {
  static tableName = 'project_links'
  static withTimestamps = false
  static primaryKey = 'id'
}
