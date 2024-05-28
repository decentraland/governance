import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import { ZodSchema, z } from 'zod'

import { TeamMember } from '../../entities/Grant/types'

export type PersonnelAttributes = TeamMember & {
  id: string
  project_id: string
  deleted: boolean
  updated_by?: string
  updated_at?: Date
  created_at: Date
}

const addressCheck = (data: string) => !data || (!!data && isEthereumAddress(data))

export type PersonnelInCreation = Pick<
  PersonnelAttributes,
  'name' | 'address' | 'role' | 'about' | 'relevantLink' | 'project_id'
>
export const PERSONNEL_IN_CREATION_SCHEMA: ZodSchema<PersonnelInCreation> = z.object({
  name: z.string().min(1).max(80),
  address: z.string().refine(addressCheck).optional().or(z.null()),
  role: z.string().min(1).max(80),
  about: z.string().min(1).max(750),
  relevantLink: z.string().min(0).max(200).url().optional().or(z.literal('')),
  project_id: z.string().min(0),
})

export default class PersonnelModel extends Model<PersonnelAttributes> {
  static tableName = 'personnel'
  static withTimestamps = false
  static primaryKey = 'id'
}
