import { ProjectStatus } from '../../entities/Grant/types'
import { getEnumDisplayName } from '../../helpers'
import Pill, { PillColor } from '../Common/Pill'

interface Props {
  status: ProjectStatus
}

const STATUS_COLORS: Record<ProjectStatus, PillColor> = {
  [ProjectStatus.InProgress]: PillColor.Green,
  [ProjectStatus.Finished]: PillColor.Orange,
  [ProjectStatus.Revoked]: PillColor.Purple,
  [ProjectStatus.Paused]: PillColor.Gray,
  [ProjectStatus.Pending]: PillColor.Gray,
}

export default function ProjectStatusPill({ status }: Props) {
  const displayedStatus = getEnumDisplayName(status)

  return (
    <Pill size="sm" color={STATUS_COLORS[status]}>
      {displayedStatus}
    </Pill>
  )
}
