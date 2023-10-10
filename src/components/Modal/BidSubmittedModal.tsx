import { ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { proposalUrl } from '../../entities/Proposal/utils'
import useBidsInfoOnTender from '../../hooks/useBidsInfoOnTender'
import useFormatMessage from '../../hooks/useFormatMessage'
import { getGoogleCalendarUrl } from '../../utils/projects'

import ProposalPendingModal from './ProposalPendingModal'

interface Props {
  proposal: ProposalAttributes
}

export default function BidSubmittedModal({ proposal, ...props }: Props & ModalProps) {
  const t = useFormatMessage()
  const { publishAt } = useBidsInfoOnTender(proposal.id)

  return (
    <ProposalPendingModal
      title={t(`modal.proposal_pending.bid_title`)}
      description={t(`modal.proposal_pending.bid_description`)}
      helper={t(`modal.proposal_pending.bid_helper`)}
      calendarUrl={
        publishAt
          ? getGoogleCalendarUrl({
              title: t(`modal.proposal_pending.bid_calendar_title`),
              details: t(`modal.proposal_pending.bid_calendar_details`, { url: proposalUrl(proposal.id) }),
              startAt: publishAt,
            })
          : null
      }
      votingStartsAt={publishAt}
      {...props}
    />
  )
}
