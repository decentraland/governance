import { Model } from 'decentraland-gatsby/dist/entities/Database/model'

export type ProjectMilestone = {
  id: string
  project_id: string
  title: string
  description: string
  status: MilestoneStatus
  updated_by?: string
  updated_at?: Date
  created_by: string
  created_at: Date
}

export enum MilestoneStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Done = 'Done',
}

export default class ProjectMilestoneModel extends Model<ProjectMilestone> {
  static tableName = 'project_milestones'
  static withTimestamps = false
  static primaryKey = 'id'
}
