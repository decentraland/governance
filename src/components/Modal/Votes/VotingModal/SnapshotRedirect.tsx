import React from 'react'

import Link from 'decentraland-gatsby/dist/components/Text/Link'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes } from '../../../../entities/Proposal/types'
import SnapshotRedirectButton from '../../../Common/SnapshotRedirectButton'
import VotingDisabled from '../../../Icon/VotingDisabled'
import '../../ProposalModal.css'

import './SnapshotRedirect.css'
import './VotingModal.css'

interface Props {
  proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>
  onReviewFeedback: () => void
}

export function SnapshotRedirect({ proposal, onReviewFeedback }: Props) {
  return (
    <Modal.Content>
      <div className="SnapshotRedirect__Content">
        <VotingDisabled className="SnapshotRedirect__Icon" />
        <span className="SnapshotRedirect__Header">Voting not available</span>
        <div className="SnapshotRedirect__Description">
          {"It looks like we're having issues casting your vote from the Governance dApp."}
        </div>
        <Markdown className="SnapshotRedirect__Suggestion">
          {'You can try voting directly on **Snapshot** - the system we use for decision-making.'}
        </Markdown>
      </div>
      <div className="SnapshotRedirect__Actions">
        <SnapshotRedirectButton proposal={proposal} />
        <Link className="SnapshotRedirect__FeedbackLink" onClick={onReviewFeedback}>
          {'What about my extra feedback?'}
        </Link>
      </div>
    </Modal.Content>
  )
}
