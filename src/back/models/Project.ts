import crypto from 'crypto'
import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, join, table } from 'decentraland-gatsby/dist/entities/Database/utils'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import isUUID from 'validator/lib/isUUID'

import CoauthorModel from '../../entities/Coauthor/model'
import { CoauthorStatus } from '../../entities/Coauthor/types'
import { ProjectStatus } from '../../entities/Grant/types'
import ProposalModel from '../../entities/Proposal/model'
import { ProjectFunding, ProposalProject } from '../../entities/Proposal/types'

import PersonnelModel, { PersonnelAttributes } from './Personnel'
import ProjectLinkModel, { ProjectLink } from './ProjectLink'
import ProjectMilestoneModel, { ProjectMilestone } from './ProjectMilestone'

export type ProjectAttributes = {
  id: string
  proposal_id: string
  title: string
  status: ProjectStatus
  about?: string
  about_updated_by?: string
  about_updated_at?: Date
  updated_at?: Date
  created_at: Date
}

export type Project = ProjectAttributes & {
  personnel: PersonnelAttributes[]
  links: ProjectLink[]
  milestones: ProjectMilestone[]
  author: string
  coauthors: string[] | null
  vesting_addresses: string[]
  funding?: ProjectFunding
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
            p.vesting_addresses as vesting_addresses,
            COALESCE(json_agg(DISTINCT to_jsonb(pe.*)) FILTER (WHERE pe.id IS NOT NULL), '[]')  as personnel,
            COALESCE(json_agg(DISTINCT to_jsonb(mi.*)) FILTER (WHERE mi.id IS NOT NULL), '[]')  as milestones,
            COALESCE(json_agg(DISTINCT to_jsonb(li.*)) FILTER (WHERE li.id IS NOT NULL), '[]')  as links,
            COALESCE(array_agg(co.address) FILTER (WHERE co.address IS NOT NULL), '{}') AS coauthors
        FROM ${table(ProjectModel)} pr
                 JOIN ${table(ProposalModel)} p ON pr.proposal_id = p.id
                 LEFT JOIN ${table(PersonnelModel)} pe ON pr.id = pe.project_id AND pe.deleted = false
                 LEFT JOIN ${table(ProjectMilestoneModel)} mi ON pr.id = mi.project_id
                 LEFT JOIN ${table(ProjectLinkModel)} li ON pr.id = li.project_id
                 LEFT JOIN ${table(CoauthorModel)} co ON pr.proposal_id = co.proposal_id 
                        AND co.status = ${CoauthorStatus.APPROVED}
        WHERE pr.id = ${id}
        GROUP BY pr.id, p.user, p.vesting_addresses;
    `

    const result = await this.namedQuery<Project>(`get_project`, query)
    if (!result || result.length === 0) {
      throw new Error(`Project not found: "${id}"`)
    }

    return result[0]
  }

  static async migrate(proposals: ProposalProject[]) {
    const values = proposals.map(
      ({ id, title, about, status, updated_at }) =>
        SQL`(${crypto.randomUUID()}, ${id}, ${title}, ${about}, ${status}, ${new Date(updated_at)})`
    )

    const query = SQL`
      INSERT INTO ${table(ProjectModel)} (id, proposal_id, title, about, status, created_at)
      VALUES ${join(values, SQL`, `)}
      RETURNING *;
    `

    return this.namedQuery<ProjectAttributes>(`create_multiple_projects`, query)
  }

  static async isAuthorOrCoauthor(user: string, projectId: string): Promise<boolean> {
    if (!isUUID(projectId || '')) {
      throw new Error(`Invalid project id: "${projectId}"`)
    }
    if (!isEthereumAddress(user)) {
      throw new Error(`Invalid user: "${user}"`)
    }

    const query = SQL`
      SELECT EXISTS (
        SELECT 1
        FROM ${table(ProjectModel)} pr
        JOIN ${table(ProposalModel)} p ON pr.proposal_id = p.id
        LEFT JOIN ${table(CoauthorModel)} co ON pr.proposal_id = co.proposal_id 
              AND co.status = ${CoauthorStatus.APPROVED}
        WHERE pr.id = ${projectId}
          AND (p.user = ${user} OR co.address = ${user})
      ) AS "exists"
    `

    const result = await this.namedQuery<{ exists: boolean }>(`is_author_or_coauthor`, query)
    return result[0]?.exists || false
  }
}
