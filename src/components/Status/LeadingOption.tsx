import { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { ProposalStatus } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'

import './LeadingOption.css'

const FINISHED_STATUSES = [
  ProposalStatus.Passed,
  ProposalStatus.Rejected,
  ProposalStatus.Finished,
  ProposalStatus.OutOfBudget,
  ProposalStatus.Enacted,
]

interface Props {
  leadingOption: string | null
  userChoice: string | null
  metVP: boolean
  status: ProposalStatus
}

export default function LeadingOption({ status, leadingOption, metVP, userChoice }: Props) {
  const t = useFormatMessage()
  const [user] = useAuthContext()

  const showLeadingOption = !user || !!userChoice

  const proposalFinished = useMemo(() => {
    return FINISHED_STATUSES.includes(status)
  }, [status])

  return (
    <div className="LeadingOption">
      <p className="LeadingOption__Text">
        {status === ProposalStatus.Active && showLeadingOption && (
          <span title={leadingOption || ''}>
            {t('page.proposal_detail.leading_option_label')}
            <strong>{leadingOption}</strong>.
          </span>
        )}
        {proposalFinished && (
          <span title={leadingOption || ''}>
            {metVP && t('page.proposal_detail.finished_result_label')}
            {!metVP ? t('page.proposal_detail.threshold_not_met_label') : <strong>{leadingOption}</strong>}.
          </span>
        )}
        {userChoice && (
          <span title={userChoice || ''}>
            {t('page.proposal_detail.your_vote_label')}
            <strong>{userChoice}</strong>
          </span>
        )}
      </p>
    </div>
  )
}
