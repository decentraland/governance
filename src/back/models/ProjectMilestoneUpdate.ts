import { Model } from 'decentraland-gatsby/dist/entities/Database/model'

export type ProjectMilestoneUpdate = {
  id: string
  update_id: string
  milestone_id: string
  description: string
  tasks: string[]
  created_at: Date
}

export default class ProjectMilestoneUpdateModel extends Model<ProjectMilestoneUpdate> {
  static tableName = 'project_milestone_updates'
  static withTimestamps = false
  static primaryKey = 'id'
}
