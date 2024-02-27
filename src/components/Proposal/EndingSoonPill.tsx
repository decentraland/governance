import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { useProposalDateText } from '../../hooks/useProposalDateText'
import { ColorsConfig } from '../Category/CategoryPill'
import Pill from '../Common/Pill'
import Clock from '../Icon/Clock'

interface Props {
  proposal: ProposalAttributes
}

export default function EndingSoonPill({ proposal }: Props) {
  const { type, start_at, finish_at } = proposal
  const isMobile = useMobileMediaQuery()
  const dateText = useProposalDateText(start_at, finish_at)
  const pillColor = ColorsConfig[type]
  const pillSize = isMobile ? 'sm' : 'md'

  return (
    <Pill style="light" color={pillColor} className="EndingSoonPill" size={pillSize} icon={<Clock color={pillColor} />}>
      {dateText}
    </Pill>
  )
}
