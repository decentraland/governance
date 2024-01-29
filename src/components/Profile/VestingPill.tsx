import { ProjectStatus } from '../../entities/Grant/types'
import Pill, { PillColor, PillStyle } from '../Common/Pill'
import Check from '../Icon/Check'
import Cross from '../Icon/Cross'
import Pause from '../Icon/Pause'

type Props = {
  className?: string
  status: ProjectStatus
}

const ColorsConfig: Record<ProjectStatus, PillColor> = {
  [ProjectStatus.Pending]: PillColor.Gray,
  [ProjectStatus.InProgress]: PillColor.Gray,
  [ProjectStatus.Finished]: PillColor.Green,
  [ProjectStatus.Revoked]: PillColor.Red,
  [ProjectStatus.Paused]: PillColor.Orange,
}

const IconConfig: Partial<Record<ProjectStatus, React.ReactNode>> = {
  [ProjectStatus.Finished]: <Check size={14} color="var(--green-800)" />,
  [ProjectStatus.Revoked]: <Cross size={7} color="var(--red-800)" />,
  [ProjectStatus.Paused]: <Pause size={7} color="var(--orange-800)" />,
}

function VestingPill({ className, status }: Props) {
  return (
    <Pill
      className={className}
      color={ColorsConfig[status]}
      size="sm"
      style={PillStyle.Outline}
      icon={IconConfig[status]}
    >
      {status}
    </Pill>
  )
}

export default VestingPill
