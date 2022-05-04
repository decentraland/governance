import React from 'react'

import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import { SnapshotVoteWithProposal } from '../../../entities/Votes/types'
import locations from '../../../modules/locations'
import CategoryLabel from '../../Category/CategoryLabel'
import StatusLabel from '../../Status/StatusLabel'

import './VotedInitiative.css'

const VotedInitiative = ({ vote }: { vote: SnapshotVoteWithProposal }) => {
  const t = useFormatMessage()
  const { choice, proposal } = vote

  return (
    <Link className="VotedInitiative" href={locations.proposal(proposal.proposal_id)} target="_blank">
      <Popup
        className="VotedInitiative__PopupVote"
        content={<span>{proposal.title}</span>}
        trigger={<h2 className="VotedInitiative__Title">{proposal.title}</h2>}
        on="hover"
      />
      <div className="VotedInitiative__ProposalDetails">
        <Popup
          className="VotedInitiative__PopupVote"
          content={<span>{proposal.choices[choice - 1]}</span>}
          trigger={
            <div className="VotedInitiative__Vote">
              {t('modal.vp_delegation.details.stats_initiatives_voted')}
              <span className="VotedInitiative__Vote--highlight">{proposal.choices[choice - 1]}</span>
            </div>
          }
        />
        {proposal.type && <CategoryLabel type={proposal.type} />}
        {proposal.status && <StatusLabel status={proposal.status} />}
      </div>
    </Link>
  )
}

export default VotedInitiative
