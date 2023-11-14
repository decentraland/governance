import { useIntl } from 'react-intl'

import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

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

function formatDate(date: Time.Dayjs, isMobile: boolean) {
  return isMobile ? date.format('MM/DD/YY') : date.fromNow()
}

export default function ProjectCard({ proposal }: Props) {
  const t = useFormatMessage()
  const { id, title, contract, configuration } = proposal
  const isMobile = useMobileMediaQuery()
  const finishAt = Time.unix(contract?.finish_at || 0)
  const startAt = Time.unix(contract?.start_at || 0)
  const dateText = finishAt.isBefore(Time())
    ? t('page.proposal_detail.author_details.sidebar.project_ended', {
        date: formatDate(finishAt, isMobile),
      })
    : t('page.proposal_detail.author_details.sidebar.project_began', {
        date: formatDate(startAt, isMobile),
      })
  const { formatNumber } = useIntl()
  const budget = getBudget(proposal)

  return (
    <ProposalCardContainer id={id} title={title}>
      <div className="ProjectCard__Details">
        <ProjectPill type={configuration.category} style="light" />
        <div className="ProjectCard__BudgetAndDate">
          <span>{formatNumber(budget || 0, CURRENCY_FORMAT_OPTIONS)}</span>
          <span>{' · '}</span>
          <span>{dateText}</span>
        </div>
      </div>
    </ProposalCardContainer>
  )
}
