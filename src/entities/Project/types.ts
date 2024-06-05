import isEthereumAddress from 'validator/lib/isEthereumAddress'
import { ZodSchema, z } from 'zod'

import { PersonnelAttributes } from '../../back/models/Personnel'
import { ProjectLink } from '../../back/models/ProjectLink'
import { ProjectMilestone } from '../../back/models/ProjectMilestone'

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

export type ProjectLinkInCreation = Pick<ProjectLink, 'label' | 'url' | 'project_id'>
export const ProjectLinkInCreationSchema: ZodSchema<ProjectLinkInCreation> = z.object({
  label: z.string().min(1).max(80),
  url: z.string().min(0).max(200).url(),
  project_id: z.string().min(0),
})

export type ProjectMilestoneInCreation = Pick<
  ProjectMilestone,
  'title' | 'description' | 'delivery_date' | 'project_id'
>
export const ProjectMilestoneInCreationSchema: ZodSchema<ProjectMilestoneInCreation> = z.object({
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(750),
  delivery_date: z.date(),
  project_id: z.string().min(0),
})
