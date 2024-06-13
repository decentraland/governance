import { ProjectService } from '../../services/ProjectService'

export async function migrateProjects() {
  const result = await ProjectService.migrateProjects()
  if (result.error || result.migrationErrors.length > 0) {
    throw JSON.stringify(result)
  }

  return result
}
