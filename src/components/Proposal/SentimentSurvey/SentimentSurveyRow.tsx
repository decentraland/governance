import React, { useCallback, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { ReactionType, Topic } from '../../../entities/SurveyTopic/types'
import IconHelper from '../../Helper/IconHelper'
import AddReaction from '../../Icon/AddReaction'
import AngryEmoji from '../../Icon/AngryEmoji'
import GreyX from '../../Icon/GreyX'
import PartyEmoji from '../../Icon/PartyEmoji'
import PokerFaceEmoji from '../../Icon/PokerFaceEmoji'

import './SentimentSurveyRow.css'

interface Props {
  topic: Topic
  onReactionPicked: (topic: Topic, reaction: ReactionType) => void
  onReactionUnpicked: (topic: Topic) => void
}

type ReactionView = { reaction: ReactionType; label: string; icon: (size?: number) => JSX.Element }

export const REACTIONS_VIEW: ReactionView[] = [
  { reaction: ReactionType.HAPPY, label: 'happy', icon: (size) => <PartyEmoji size={size} /> },
  { reaction: ReactionType.INDIFFERENT, label: 'indifferent', icon: (size) => <PokerFaceEmoji size={size} /> },
  { reaction: ReactionType.ANGRY, label: 'angry', icon: (size) => <AngryEmoji size={size} /> },
]

const SentimentSurveyRow = ({ topic, onReactionPicked, onReactionUnpicked }: Props) => {
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
  }, [])

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
            return (
              <div key={`Reaction__${index}`} onClick={() => pickReaction(reactionView.reaction)}>
                <IconHelper text={reactionView.label} icon={reactionView.icon()} position={'bottom center'} />
              </div>
            )
          })}
          <div onClick={() => setShowReactions(false)}>
            <GreyX />
          </div>
        </div>
      )}

      {reactionPicked && (
        <div className="SentimentSurveyRow__Reactions SentimentSurveyRow__PickedReaction">
          {REACTIONS_VIEW.map((reactionView, index) => {
            return (
              pickedReaction === reactionView.reaction && (
                <div key={`Reaction__${index}`} onClick={() => changeReaction()}>
                  {reactionView.icon}
                </div>
              )
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SentimentSurveyRow
