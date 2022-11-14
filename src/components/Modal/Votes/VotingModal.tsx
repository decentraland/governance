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

import { Survey, SurveyTopicAttributes } from '../../../entities/SurveyTopic/types'
import { formatChoice } from '../../../modules/votes/utils'
import { ProposalPageContext, SelectedChoice } from '../../../pages/proposal'
import OpenExternalLink from '../../Icon/OpenExternalLink'
import VotingDisabled from '../../Icon/VotingDisabled'
import SentimentSurvey from '../../Proposal/SentimentSurvey/SentimentSurvey'
import '../ProposalModal.css'

import './VotingModal.css'

interface VotingModalProps {
  open: boolean
  surveyTopics: Pick<SurveyTopicAttributes, 'label' | 'topic_id'>[] | null
  isLoadingSurveyTopics: boolean
  onCastVote: (selectedChoice: SelectedChoice, survey?: Survey) => void
  onClose: () => void
  castingVote: boolean
  proposalContext: ProposalPageContext
}

export const SECONDS_FOR_VOTING_RETRY = 5

export function VotingModal({
  open,
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

  if (!selectedChoice.choiceIndex || !selectedChoice.choice) {
    return null
  }

  return (
    <Modal size="tiny" className="VotingModal ProposalModal" open={open} closeIcon={<Close />} onClose={onClose}>
      {!showSnapshotRedirect && (
        <Modal.Content>
          <div className="ProposalModal__Title">
            <Header>{"We'd appreciate some extra feedback"}</Header>
            <Paragraph small>{`You're about to vote "${formatChoice(selectedChoice.choice)}"`}</Paragraph>
          </div>
          <SentimentSurvey
            surveyTopics={surveyTopics}
            isLoadingSurveyTopics={isLoadingSurveyTopics}
            setSurvey={setSurvey}
          />
          <div className="VotingModal__Actions">
            <div
              className={TokenList.join([
                'VotingModal__ErrorNotice',
                !showVotingError && 'VotingModal__ErrorNotice--hidden',
              ])}
            >
              {'Failed to cast vote'}
            </div>
            <Button
              fluid
              primary
              onClick={() => onCastVote(selectedChoice, survey)}
              loading={castingVote}
              disabled={showVotingError}
              className="VotingModal__CastVote"
            >
              {showVotingError ? `Retry in ${retryTimer}...` : t('page.proposal_detail.cast_vote')}
            </Button>
          </div>
        </Modal.Content>
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
              // onClick={() => onVoteOnSnapshot(selectedChoice)}
              className="VoteOnSnapshot__Button"
            >
              {'Vote On Snapshot'}
              <OpenExternalLink className="VoteOnSnapshot__ButtonIcon" />
            </Button>
            <Link className="VoteOnSnapshot__FeedbackLink">{'What about my extra feedback?'}</Link>
          </div>
        </Modal.Content>
      )}
    </Modal>
  )
}
