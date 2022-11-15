import React from 'react'

import Link from 'decentraland-gatsby/dist/components/Text/Link'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { snapshotProposalUrl } from '../../../entities/Proposal/utils'
import OpenExternalLink from '../../Icon/OpenExternalLink'
import VotingDisabled from '../../Icon/VotingDisabled'
import '../ProposalModal.css'

import './VotingModal.css'

interface Props {
  proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>
}

export function VoteOnSnapshot({ proposal }: Props) {
  return (
    <Modal.Content>
      <div className="VoteOnSnapshot__Content">
        <VotingDisabled className="VoteOnSnapshot__Icon" />
        <span className="VoteOnSnapshot__Header">Voting not available</span>
        <div className="VoteOnSnapshot__Description">
          {"It looks like we're having issues casting your vote from the Governance dApp."}
        </div>
        <Markdown className="VoteOnSnapshot__Suggestion">
          {'You can try voting directly on **Snapshot** - the system we use for decision-making.'}
        </Markdown>
      </div>
      <div className="VoteOnSnapshot__Actions">
        <Button
          fluid
          primary
          href={snapshotProposalUrl(proposal)}
          target="_blank"
          rel="noopener noreferrer"
          className="VoteOnSnapshot__Button"
        >
          <div className="VoteOnSnapshot__Hidden" />
          {'Vote On Snapshot'}
          <OpenExternalLink className="VoteOnSnapshot__ButtonIcon" />
        </Button>
        <Link className="VoteOnSnapshot__FeedbackLink">{'What about my extra feedback?'}</Link>
      </div>
    </Modal.Content>
  )
}
