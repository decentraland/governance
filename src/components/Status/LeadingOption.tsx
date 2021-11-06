import React from 'react'
import './LeadingOption.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { ProposalStatus } from '../../entities/Proposal/types'

export type LeadingOptionProps = React.HTMLAttributes<HTMLDivElement> & {
  leadingOption: string
  status: ProposalStatus
}

export default React.memo(function LeadingOption({ status, leadingOption, ...props }: LeadingOptionProps) {
  const l = useFormatMessage()
  return <div {...props} className="LeadingOption">
    {status !== ProposalStatus.Pending &&
    <Paragraph small secondary>
      {status === ProposalStatus.Active && (l('page.proposal_detail.leading_option_label') || 'Leading option: ')}
      {[ProposalStatus.Passed, ProposalStatus.Rejected, ProposalStatus.Finished, ProposalStatus.Enacted].includes(status) && (l('page.proposal_detail.finished_result_label') || 'Result: ')}
      <strong>{leadingOption}</strong>
    </Paragraph>
    }
  </div>
})
