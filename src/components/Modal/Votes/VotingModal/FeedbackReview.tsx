import React, { useCallback } from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useClipboardCopy from 'decentraland-gatsby/dist/hooks/useClipboardCopy'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { snapshotProposalUrl } from '../../../../entities/Proposal/utils'
import { Survey, SurveyTopicAttributes, Topic } from '../../../../entities/SurveyTopic/types'
import { SurveyEncoder } from '../../../../entities/SurveyTopic/utils'
import SentimentSurvey from '../../../Proposal/SentimentSurvey/SentimentSurvey'
import '../../ProposalModal.css'

import './FeedbackReview.css'
import './VotingModal.css'

interface Props {
  proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>
  survey: Survey
  setSurvey: React.Dispatch<React.SetStateAction<Survey>>
  surveyTopics: Topic[] | null
  isLoadingSurveyTopics: boolean
}

export function FeedbackReview({ proposal, survey, setSurvey, surveyTopics, isLoadingSurveyTopics }: Props) {
  const t = useFormatMessage()
  const [copied, state] = useClipboardCopy(Time.Second)

  const handleCopy = useCallback(() => {
    state.copy(SurveyEncoder.encode(survey))
  }, [state])

  return (
    <Modal.Content>
      <div className="ProposalModal__Title">
        <Header>{t('survey.feedback_review.title')}</Header>
      </div>
      <SentimentSurvey
        survey={survey}
        surveyTopics={surveyTopics}
        isLoadingSurveyTopics={isLoadingSurveyTopics}
        setSurvey={setSurvey}
      />
      <div className="FeedbackReview__Actions">
        <Button className="FeedbackReview__CopyContent" primary size="small" onClick={handleCopy}>
          <span>{t(`survey.feedback_review.${copied ? 'content_copied' : 'copy_content'}`)}</span>
        </Button>
        <Button
          fluid
          primary
          href={snapshotProposalUrl(proposal)}
          target="_blank"
          rel="noopener noreferrer"
          className="FeedbackReview__OpenSnapshot"
        >
          {t('survey.feedback_review.open_snapshot')}
        </Button>
      </div>
      <Markdown className="FeedbackReview__Explanation">{t('survey.feedback_review.explanation')}</Markdown>
    </Modal.Content>
  )
}
