import React from 'react'
import './LeadingOption.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { ProposalStatus } from '../../entities/Proposal/types'

export type LeadingOptionProps = React.HTMLAttributes<HTMLDivElement> & {
  leadingOption: string | null
  metVP: boolean
  status: ProposalStatus
}

export default React.memo(function LeadingOption({ status, leadingOption, metVP}: LeadingOptionProps) {
  const l = useFormatMessage()

  function proposalFinished() {
    return [ProposalStatus.Passed, ProposalStatus.Rejected, ProposalStatus.Finished, ProposalStatus.Enacted].includes(status)
  }

  return <div className="LeadingOption">
    {status !== ProposalStatus.Pending &&
    <Paragraph small secondary>
      {status === ProposalStatus.Active && (l('page.proposal_detail.leading_option_label'))}
      {proposalFinished() && (l('page.proposal_detail.finished_result_label'))}{': '}
      <strong>{leadingOption}</strong>
      {proposalFinished() && !metVP && (' - ' + l('page.proposal_detail.threshold_not_met_label'))}
    </Paragraph>
    }
  </div>
})
