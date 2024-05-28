import isEthereumAddress from 'validator/lib/isEthereumAddress'
import { ZodSchema, z } from 'zod'

import { PersonnelAttributes } from '../../back/models/Personnel'

const addressCheck = (data: string) => !data || (!!data && isEthereumAddress(data))

export type PersonnelInCreation = Pick<
  PersonnelAttributes,
  'name' | 'address' | 'role' | 'about' | 'relevantLink' | 'project_id'
>
export const PersonnelInCreationSchema: ZodSchema<PersonnelInCreation> = z.object({
  name: z.string().min(1).max(80),
  address: z.string().refine(addressCheck).optional().or(z.null()),
  role: z.string().min(1).max(80),
  about: z.string().min(1).max(750),
  relevantLink: z.string().min(0).max(200).url().optional().or(z.literal('')),
  project_id: z.string().min(0),
})
