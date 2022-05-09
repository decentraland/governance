import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { Match } from '../../../entities/Snapshot/utils'
import { VotedProposal } from '../../../entities/Votes/types'

import VotedInitiative from './VotedInitiative'
import './VotedInitiativeList.css'

type Props = {
  candidateVotes: VotedProposal[]
  matches?: Match[]
}

function VotedInitiativeList({ candidateVotes, matches }: Props) {
  const t = useFormatMessage()

  return (
    <div className="VotedInitiativeList">
      <span className="VotedInitiativeList__Title">{t('modal.vp_delegation.details.stats_initiatives_title')}</span>
      <div className="VotedInitiativeList__List">
        {candidateVotes.map((item) => {
          const match = matches?.find((p) => p.proposal_id === item.proposal.id)
          return <VotedInitiative key={item.id} vote={item} voteMatch={match?.sameVote} />
        })}
      </div>
    </div>
  )
}

export default VotedInitiativeList
