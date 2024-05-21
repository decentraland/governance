import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'
import isUUID from 'validator/lib/isUUID'

import CoauthorModel from '../../entities/Coauthor/model'
import { CoauthorStatus } from '../../entities/Coauthor/types'
import { ProjectStatus } from '../../entities/Grant/types'
import ProposalModel from '../../entities/Proposal/model'

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

// TODO: add here all data from other tables (updates, personnel, milestones, etc)
export type Project = ProjectAttributes & {
  personnel: PersonnelAttributes[]
  author: string
  coauthors: string[] | null
}

export default class ProjectModel extends Model<ProjectAttributes> {
  static tableName = 'projects'
  static withTimestamps = false
  static primaryKey = 'id'

  static async getProject(id: string) {
    if (!isUUID(id || '')) {
      throw new Error(`Invalid project id: "${id}"`)
    }

    const query = SQL`
        SELECT
            pr.*,
            p.user as author,
            COALESCE(json_agg(
                     json_build_object(
                             'id', pe.id,
                             'project_id', pe.project_id,
                             'address', pe.address,
                             'name', pe.name,
                             'role', pe.role,
                             'about', pe.about,
                             'relevantLink', pe."relevantLink",
                             'updated_by', pe.updated_by,
                             'updated_at', pe.updated_at,
                             'created_at', pe.created_at
                     ) ORDER BY pe.id) FILTER (WHERE pe.id IS NOT NULL), '[]') AS personnel,
            COALESCE(array_agg(co.address) FILTER (WHERE co.address IS NOT NULL), '{}') AS coauthors
        FROM ${table(ProjectModel)} pr
                 JOIN ${table(ProposalModel)} p ON pr.proposal_id = p.id
                 LEFT JOIN ${table(PersonnelModel)} pe ON pr.id = pe.project_id AND pe.deleted = false
                 LEFT JOIN ${table(CoauthorModel)} co ON pr.proposal_id = co.proposal_id AND co.status = ${
      CoauthorStatus.APPROVED
    }
        WHERE pr.id = ${id}
        GROUP BY pr.id, p.user;
    `

    const result = await this.namedQuery<Project>(`get_project`, query)
    if (!result || result.length === 0) {
      throw new Error(`Project not found: "${id}"`)
    }

    return result[0]
  }
}
