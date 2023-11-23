import { useIntl } from 'react-intl'

import { Desktop } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Time from '../../../utils/date/Time'
import ProjectPill from '../../Projects/ProjectPill'
import StatusPill from '../../Status/StatusPill'

import './GrantCard.css'
import ProposalCardContainer from './ProposalCardContainer'

interface Props {
  proposal: ProposalAttributes
}

export default function GrantCard({ proposal }: Props) {
  const t = useFormatMessage()
  const { id, title, configuration, status, start_at, finish_at } = proposal
  const dateText = Time(finish_at).isBefore(Time())
    ? t('page.proposal_detail.author_details.sidebar.voting_ended', {
        date: Time(finish_at).fromNow(),
      })
    : t('page.proposal_detail.author_details.sidebar.voting_began', {
        date: Time(start_at).fromNow(),
      })
  const { formatNumber } = useIntl()

  return (
    <ProposalCardContainer id={id} title={title}>
      <div className="GrantCard__Details">
        {status && <StatusPill status={status} size="sm" />}
        <ProjectPill type={configuration.category} style="light" />
        <div className="GrantCard__BudgetAndDate">
          <span>{formatNumber(configuration.size || 0, CURRENCY_FORMAT_OPTIONS)}</span>
          <Desktop>
            <span>{' · '}</span>
            <span>{dateText}</span>
          </Desktop>
        </div>
      </div>
    </ProposalCardContainer>
  )
}
