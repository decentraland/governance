import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { ProjectStatus } from '../../entities/Grant/types'

import PersonnelModel, { PersonnelAttributes } from './Personnel'

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

export type Project = ProjectAttributes & {
  personnel: PersonnelAttributes[]
}

export default class ProjectModel extends Model<ProjectAttributes> {
  static tableName = 'projects'
  static withTimestamps = false
  static primaryKey = 'id'

  public static async getProject(id: string) {
    const query = SQL`
        SELECT
            p.*,
            COALESCE(json_agg(
                     json_build_object(
                             'id', pe.id,
                             'project_id', pe.project_id,
                             'address', pe.address,
                             'name', pe.name,
                             'role', pe.role,
                             'about', pe.about,
                             'relevantLink', pe.relevantLink,
                             'status', pe.status,
                             'updated_by', pe.updated_by,
                             'updated_at', pe.updated_at,
                             'created_at', pe.created_at
                     ) ORDER BY pe.id) FILTER (WHERE pe.id IS NOT NULL), '[]') AS personnel
        FROM ${table(ProjectModel)}  p
        LEFT JOIN ${table(PersonnelModel)} pe ON p.id = pe.project_id
        WHERE p.id = ${id}
        GROUP BY p.id;
    `

    const result = await this.namedQuery('get_project', query)
    if (!result || result.length === 0) {
      throw new Error(`Project not found: "${id}"`)
    }

    return result[0]
  }
}
