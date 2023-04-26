import React, { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ProposalStatus } from '../../entities/Proposal/types'

import './LeadingOption.css'

export type LeadingOptionProps = React.HTMLAttributes<HTMLDivElement> & {
  leadingOption: string | null
  userChoice: string | null
  metVP: boolean
  status: ProposalStatus
}

export default React.memo(function LeadingOption({ status, leadingOption, metVP, userChoice }: LeadingOptionProps) {
  const t = useFormatMessage()
  const [user] = useAuthContext()

  const showLeadingOption = !user || !!userChoice

  const proposalFinished = useMemo(() => {
    return [
      ProposalStatus.Passed,
      ProposalStatus.Rejected,
      ProposalStatus.Finished,
      ProposalStatus.OutOfBudget,
      ProposalStatus.Enacted,
    ].includes(status)
  }, [status])

  return (
    <div className="LeadingOption">
      {status !== ProposalStatus.Pending && (
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
      )}
    </div>
  )
})
