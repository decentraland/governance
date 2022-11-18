import React, { useCallback, useEffect, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { ReactionType, Topic } from '../../../entities/SurveyTopic/types'
import { REACTIONS_VIEW } from '../../../entities/SurveyTopic/utils'
import IconHelper from '../../Helper/IconHelper'
import AddReaction from '../../Icon/AddReaction'
import Cross from '../../Icon/Cross'

import './SentimentSurveyRow.css'

interface Props {
  topic: Topic
  reaction?: ReactionType | null
  onReactionPicked: (topic: Topic, reaction: ReactionType) => void
  onReactionUnpicked: (topic: Topic) => void
}

const SentimentSurveyRow = ({ topic, reaction, onReactionPicked, onReactionUnpicked }: Props) => {
  const t = useFormatMessage()
  const [showAddReaction, setShowAddReaction] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [pickedReaction, setPickedReaction] = useState<ReactionType | null>()
  const reactionPicked = pickedReaction != null

  const pickReaction = useCallback(
    (reaction: ReactionType) => {
      setShowReactions(false)
      setPickedReaction(reaction)
      onReactionPicked(topic, reaction)
    },
    [onReactionPicked, topic]
  )

  const changeReaction = useCallback(() => {
    setPickedReaction(null)
    onReactionUnpicked(topic)
    setShowReactions(true)
    setShowAddReaction(true)
  }, [onReactionUnpicked, topic])

  useEffect(() => {
    if (reaction && reaction !== ReactionType.EMPTY) {
      setShowReactions(false)
      setPickedReaction(reaction)
    }
  }, [reaction])

  return (
    <div
      className={TokenList.join(['SentimentSurveyRow', showAddReaction && 'SentimentSurveyRow__Expanded'])}
      onMouseEnter={() => !reactionPicked && setShowAddReaction(true)}
      onMouseLeave={() => setShowAddReaction(false)}
    >
      {t(`survey.survey_topics.${topic.label}`)}

      {!showReactions && !reactionPicked && (
        <div id="slide" className="SentimentSurveyRow__AddReaction" onClick={() => setShowReactions(true)}>
          <AddReaction />
          <span className={TokenList.join([showAddReaction && 'SentimentSurveyRow__AddReactionLabel'])}>
            {t(`survey.reactions.add_reaction`)}
          </span>
        </div>
      )}

      {showReactions && (
        <div className="SentimentSurveyRow__Reactions">
          {REACTIONS_VIEW.map((reactionView, index) => {
            if (reactionView.reaction !== ReactionType.EMPTY) {
              return (
                <div key={`Reaction__${index}`} onClick={() => pickReaction(reactionView.reaction)}>
                  <IconHelper
                    text={t(`component.reaction_icon.${reactionView.reaction}`)}
                    icon={reactionView.icon}
                    position={'bottom center'}
                  />
                </div>
              )
            }
          })}
          <div onClick={() => setShowReactions(false)}>
            <Cross />
          </div>
        </div>
      )}

      {reactionPicked && (
        <div className="SentimentSurveyRow__Reactions SentimentSurveyRow__PickedReaction">
          {REACTIONS_VIEW.map((reactionView, index) => {
            if (reactionView.reaction !== ReactionType.EMPTY) {
              return (
                pickedReaction === reactionView.reaction && (
                  <div key={`Reaction__${index}`} onClick={() => changeReaction()}>
                    {reactionView.icon}
                  </div>
                )
              )
            }
          })}
        </div>
      )}
    </div>
  )
}

export default SentimentSurveyRow
