import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI, { handleJSON } from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import {
  PersonnelInCreationSchema,
  ProjectLinkInCreationSchema,
  ProjectMilestoneInCreationSchema,
} from '../../entities/Project/types'
import CacheService, { TTL_1_HS } from '../../services/CacheService'
import { ProjectService } from '../../services/ProjectService'
import PersonnelModel, { PersonnelAttributes } from '../models/Personnel'
import ProjectLinkModel, { ProjectLink } from '../models/ProjectLink'
import ProjectMilestoneModel, { ProjectMilestone } from '../models/ProjectMilestone'
import { isValidDate, validateCanEditProject, validateId } from '../utils/validations'

export default routes((route) => {
  const withAuth = auth()
  route.get('/projects', handleJSON(getProjects))
  route.post('/projects/personnel/', withAuth, handleAPI(addPersonnel))
  route.delete('/projects/personnel/:personnel_id', withAuth, handleAPI(deletePersonnel))
  route.post('/projects/links/', withAuth, handleAPI(addLink))
  route.delete('/projects/links/:link_id', withAuth, handleAPI(deleteLink))
  route.post('/projects/milestones/', withAuth, handleAPI(addMilestone))
  route.delete('/projects/milestones/:milestone_id', withAuth, handleAPI(deleteMilestone))
  route.get('/projects/:project', handleAPI(getProject))
  route.get('/projects/pitches-total', handleJSON(getOpenPitchesTotal))
  route.get('/projects/tenders-total', handleJSON(getOpenTendersTotal))
})

type ProjectsReturnType = Awaited<ReturnType<typeof ProjectService.getProposalProjects>>

function filterProjectsByDate(projects: ProjectsReturnType, from?: Date, to?: Date): ProjectsReturnType {
  return {
    data: projects.data.filter((project) => {
      const createdAt = new Date(project.created_at)
      return (!from || createdAt >= from) && (!to || createdAt < to)
    }),
  }
}

async function getProjects(req: Request) {
  const from = isValidDate(req.query.from as string) ? new Date(req.query.from as string) : undefined
  const to = isValidDate(req.query.to as string) ? new Date(req.query.to as string) : undefined

  if (from && to && from > to) {
    throw new RequestError('Invalid date range', RequestError.BadRequest)
  }

  const cacheKey = `projects`
  const cachedProjects = CacheService.get<ProjectsReturnType>(cacheKey)
  if (cachedProjects) {
    return filterProjectsByDate(cachedProjects, from, to)
  }
  const projects = await ProjectService.getProposalProjects()
  CacheService.set(cacheKey, projects, TTL_1_HS)
  return filterProjectsByDate(projects, from, to)
}

async function getProject(req: Request<{ project: string }>) {
  const id = validateId(req.params.project)
  try {
    return await ProjectService.getUpdatedProject(id)
  } catch (e) {
    console.log(`Error getting project: ${e}`) //TODO: remove before merging projects to main
    throw new RequestError(`Project "${id}" not found`, RequestError.NotFound)
  }
}

async function getOpenPitchesTotal() {
  return await ProjectService.getOpenPitchesTotal()
}

async function getOpenTendersTotal() {
  return await ProjectService.getOpenTendersTotal()
}

async function addPersonnel(req: WithAuth): Promise<PersonnelAttributes> {
  const user = req.auth!
  const { personnel } = req.body
  const projectId = personnel.project_id
  await validateCanEditProject(user, projectId)
  const parsedPersonnel = PersonnelInCreationSchema.safeParse(personnel)
  if (!parsedPersonnel.success) {
    throw new RequestError(`Invalid personnel: ${parsedPersonnel.error.message}`, RequestError.BadRequest)
  }

  return await ProjectService.addPersonnel(parsedPersonnel.data, user)
}

async function deletePersonnel(req: WithAuth<Request<{ personnel_id: string }>>): Promise<string | null> {
  const user = req.auth!
  const personnel_id = req.params.personnel_id
  validateId(personnel_id)
  const personnel = await PersonnelModel.findOne<PersonnelAttributes>(personnel_id)
  if (!personnel) {
    throw new RequestError(`Personnel "${personnel_id}" not found`, RequestError.NotFound)
  }
  await validateCanEditProject(user, personnel.project_id)

  return await ProjectService.deletePersonnel(personnel_id, user)
}

async function addLink(req: WithAuth): Promise<ProjectLink> {
  const user = req.auth!
  const { project_link } = req.body
  await validateCanEditProject(user, project_link.project_id)
  const parsedLink = ProjectLinkInCreationSchema.safeParse(project_link)
  if (!parsedLink.success) {
    throw new RequestError(`Invalid link: ${parsedLink.error.message}`, RequestError.BadRequest)
  }

  return await ProjectService.addLink(parsedLink.data, user)
}

async function deleteLink(req: WithAuth<Request<{ link_id: string }>>): Promise<string | null> {
  const user = req.auth!
  const link_id = req.params.link_id
  validateId(link_id)
  const projectLink = await ProjectLinkModel.findOne<ProjectLink>(link_id)
  if (!projectLink) {
    throw new RequestError(`Link "${link_id}" not found`, RequestError.NotFound)
  }
  await validateCanEditProject(user, projectLink.project_id)

  return await ProjectService.deleteLink(link_id)
}
async function addMilestone(req: WithAuth): Promise<ProjectMilestone> {
  const user = req.auth!
  const { milestone } = req.body
  await validateCanEditProject(user, milestone.project_id)
  const formattedMilestone = {
    ...milestone,
    delivery_date: new Date(milestone.delivery_date),
  }
  const parsedMilestone = ProjectMilestoneInCreationSchema.safeParse(formattedMilestone)
  if (!parsedMilestone.success) {
    throw new RequestError(`Invalid milestone: ${parsedMilestone.error.message}`, RequestError.BadRequest)
  }

  return await ProjectService.addMilestone(parsedMilestone.data, user)
}

async function deleteMilestone(req: WithAuth<Request<{ milestone_id: string }>>): Promise<string | null> {
  const user = req.auth!
  const milestone_id = req.params.milestone_id
  validateId(milestone_id)
  const milestone = await ProjectMilestoneModel.findOne<ProjectMilestone>(milestone_id)
  if (!milestone) {
    throw new RequestError(`Milestone "${milestone_id}" not found`, RequestError.NotFound)
  }
  await validateCanEditProject(user, milestone.project_id)

  return await ProjectService.deleteMilestone(milestone_id)
}
