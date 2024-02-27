import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { useProposalDateText } from '../../hooks/useProposalDateText'
import { ColorsConfig } from '../Category/CategoryPill'
import Pill, { PillColor } from '../Common/Pill'
import Clock from '../Icon/Clock'

import './EndingSoonPill.css'

interface Props {
  proposal: ProposalAttributes
}

function getClockColor(pillColor: PillColor) {
  switch (pillColor) {
    case PillColor.Purple:
      return 'var(--fuchsia-500)'
    case PillColor.Yellow:
      return 'var(--yellow-900)'
    default:
      return `var(--${pillColor}-800)`
  }
}

export default function EndingSoonPill({ proposal }: Props) {
  const { type, start_at, finish_at } = proposal
  const isMobile = useMobileMediaQuery()
  const dateText = useProposalDateText(start_at, finish_at)
  const colorConfig = ColorsConfig[type]
  const pillSize = isMobile ? 'sm' : 'md'

  return (
    <Pill
      style="light"
      color={colorConfig}
      className={`EndingSoonPill--${colorConfig}`}
      size={pillSize}
      icon={<Clock color={getClockColor(colorConfig)} />}
    >
      {dateText}
    </Pill>
  )
}
