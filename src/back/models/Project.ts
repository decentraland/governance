import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL } from 'decentraland-gatsby/dist/entities/Database/utils/sql'

import { ProjectStatus } from '../../entities/Grant/types'

export type ProjectAttributes = {
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

// TODO: add here all data from other tables (updates, personnel, milestones, etc)
export type Project = ProjectAttributes & {
  author: string
  coauthors: string[] | null
}

export default class ProjectModel extends Model<ProjectAttributes> {
  static tableName = 'projects'
  static withTimestamps = false
  static primaryKey = 'id'

  static async getProject(id: string) {
    const query = SQL`
      SELECT pr.*, p.user as author, array_agg(co.address) as coauthors
      FROM projects pr
      JOIN proposals p on pr.proposal_id = p.id
      LEFT JOIN coauthors co on pr.proposal_id = co.proposal_id AND co.status = 'APPROVED'
      WHERE pr.id = ${id}
      GROUP BY pr.id, p.user;
    `
    const result = await this.namedQuery<Project>(`get_project`, query)
    return result[0]
  }
}
