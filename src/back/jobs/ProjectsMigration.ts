import { ProjectService } from '../../services/ProjectService'

export async function migrateProjects() {
  const migratedProjects = await ProjectService.migrateProjects()

  return `Migrated ${migratedProjects.length} projects`
}
