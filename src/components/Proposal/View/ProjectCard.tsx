import { useIntl } from 'react-intl'

import { ProposalAttributes, VestingContractData } from '../../../entities/Proposal/types'
import { getBudget } from '../../../entities/Proposal/utils'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Time from '../../../utils/date/Time'
import ProjectPill from '../../Projects/ProjectPill'

import './ProjectCard.css'
import ProposalCardContainer from './ProposalCardContainer'

interface Props {
  proposal: ProposalAttributes & { contract?: VestingContractData }
}

export default function ProjectCard({ proposal }: Props) {
  const t = useFormatMessage()
  const { id, title, contract, configuration } = proposal
  const finishAt = Time.unix(contract?.finish_at || 0)
  const startAt = Time.unix(contract?.start_at || 0)
  const dateText = finishAt.isBefore(Time())
    ? t('page.proposal_detail.author_details.sidebar.project_ended', { date: finishAt.fromNow() })
    : t('page.proposal_detail.author_details.sidebar.project_began', { date: startAt.fromNow() })
  const { formatNumber } = useIntl()
  const budget = getBudget(proposal)

  return (
    <ProposalCardContainer id={id} title={title}>
      <div className="ProjectCard__Details">
        <ProjectPill type={configuration.category} style="light" />
        <span className="ProjectCard__BudgetAndDate">
          <span>{formatNumber(budget || 0, CURRENCY_FORMAT_OPTIONS)}</span>
          <span>{' · '}</span>
          <span>{dateText}</span>
        </span>
      </div>
    </ProposalCardContainer>
  )
}
