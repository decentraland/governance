import React, { useState } from 'react'

import Link from 'decentraland-gatsby/dist/components/Text/Link'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { snapshotProposalUrl } from '../../../entities/Proposal/utils'
import { Survey, SurveyTopicAttributes } from '../../../entities/SurveyTopic/types'
import { formatChoice } from '../../../modules/votes/utils'
import { ProposalPageContext, SelectedChoice } from '../../../pages/proposal'
import OpenExternalLink from '../../Icon/OpenExternalLink'
import VotingDisabled from '../../Icon/VotingDisabled'
import SentimentSurvey from '../../Proposal/SentimentSurvey/SentimentSurvey'
import '../ProposalModal.css'

import './VotingModal.css'
import { VotingModalSurvey } from './VotingModalSurvey'

interface VotingModalProps {
  proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>
  surveyTopics: Pick<SurveyTopicAttributes, 'label' | 'topic_id'>[] | null
  isLoadingSurveyTopics: boolean
  onCastVote: (selectedChoice: SelectedChoice, survey?: Survey) => void
  onClose: () => void
  castingVote: boolean
  proposalContext: ProposalPageContext
}

export function VotingModal({
  proposal,
  onClose,
  surveyTopics,
  isLoadingSurveyTopics,
  onCastVote,
  castingVote,
  proposalContext,
}: VotingModalProps) {
  const t = useFormatMessage()
  const [survey, setSurvey] = useState<Survey>([])
  const { selectedChoice, showVotingError, showSnapshotRedirect, retryTimer } = proposalContext
  // const showFeedbackReview = true

  if (!selectedChoice.choiceIndex || !selectedChoice.choice) {
    return null
  }

  return (
    <Modal
      size="tiny"
      className="VotingModal ProposalModal"
      open={proposalContext.showVotingModal}
      closeIcon={<Close />}
      onClose={onClose}
    >
      {!showSnapshotRedirect && (
        <VotingModalSurvey
          survey={survey}
          setSurvey={setSurvey}
          isLoadingSurveyTopics={isLoadingSurveyTopics}
          surveyTopics={surveyTopics}
          castingVote={castingVote}
          onCastVote={onCastVote}
          proposalContext={proposalContext}
        />
      )}
      {showSnapshotRedirect && (
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
      )}
      {/*{showFeedbackReview && (*/}

      {/*)}*/}
    </Modal>
  )
}
