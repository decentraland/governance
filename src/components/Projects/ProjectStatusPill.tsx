import { ProjectStatus } from '../../entities/Grant/types'
import { getEnumDisplayName } from '../../helpers'
import Pill, { PillColor } from '../Common/Pill'

interface Props {
  status: ProjectStatus
}

const STATUS_COLORS: Record<ProjectStatus, PillColor> = {
  [ProjectStatus.InProgress]: PillColor.Green,
  [ProjectStatus.Finished]: PillColor.Green,
  [ProjectStatus.Revoked]: PillColor.Red,
  [ProjectStatus.Paused]: PillColor.Gray,
  [ProjectStatus.Pending]: PillColor.Gray,
}

export default function ProjectStatusPill({ status }: Props) {
  const displayedStatus = getEnumDisplayName(status)
  const style = status === ProjectStatus.InProgress ? 'outline' : 'shiny'

  return (
    <Pill size="sm" color={STATUS_COLORS[status]} style={style}>
      {displayedStatus}
    </Pill>
  )
}
