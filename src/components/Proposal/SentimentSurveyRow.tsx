import React, { useCallback, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { SurveyTopicAttributes } from '../../entities/SurveyTopic/types'
import locations from '../../modules/locations'
import AddReaction from '../Icon/AddReaction'

import './SentimentSurveyRow.css'

interface Props {
  topic: Pick<SurveyTopicAttributes, 'topic_id' | 'label'>
}

enum Reaction {
  HAPPY,
  INDIFFERENT,
  ANGRY,
}

export type ReactionData = {
  icon: string
  label: string
}

const KnownReactions: Record<Reaction, ReactionData> = {
  [Reaction.HAPPY]: { icon: '🥳', label: 'happy' },
  [Reaction.INDIFFERENT]: { icon: '😐', label: 'indifferent' },
  [Reaction.ANGRY]: { icon: '🤬', label: 'angry' },
}

const SentimentSurveyRow = ({ topic }: Props) => {
  const t = useFormatMessage()
  const [showAddReaction, setShowAddReaction] = useState(false)
  const [showReactions, setShowReactions] = useState(false)

  return (
    <div
      className={TokenList.join(['SentimentSurveyRow', showAddReaction && 'SentimentSurveyRow__Expanded'])}
      onMouseEnter={() => setShowAddReaction(true)}
      onMouseLeave={() => setShowAddReaction(false)}
    >
      {t(`survey.survey_topics.${topic.label}`)}
      {!showReactions && (
        <div id="slide" className={'SentimentSurveyRow__AddReaction'} onClick={() => setShowReactions(true)}>
          <AddReaction />
          <span className={TokenList.join([showAddReaction && 'SentimentSurveyRow__AddReactionLabel'])}>
            {t(`survey.reactions.add_reaction`)}
          </span>
        </div>
      )}

      {/*{showReactions && }*/}
    </div>
  )
}

export default SentimentSurveyRow
