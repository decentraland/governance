import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import { VotedProposal } from '../../../entities/Votes/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import locations from '../../../utils/locations'
import Link from '../../Common/Typography/Link'
import Cancel from '../../Icon/Cancel'
import CheckCircle from '../../Icon/CheckCircle'
import QuestionCircle from '../../Icon/QuestionCircle'

import './VotedInitiative.css'

interface Props {
  vote: VotedProposal
  voteMatch?: boolean
}

const VotedInitiative = ({ vote, voteMatch }: Props) => {
  const t = useFormatMessage()
  const { choice, proposal } = vote

  return (
    <Link className="VotedInitiative" href={locations.proposal(proposal.proposal_id)} target="_blank">
      <div className="VotedInitiative__TitleContainer">
        {voteMatch === undefined ? (
          <QuestionCircle size="16" />
        ) : voteMatch ? (
          <CheckCircle size="16" />
        ) : (
          <Cancel size="16" />
        )}
        <Popup
          className="VotedInitiative__PopupVote"
          content={<span>{proposal.title}</span>}
          trigger={<h2 className="VotedInitiative__Title">{proposal.title}</h2>}
          on="hover"
        />
      </div>
      <div className="VotedInitiative__ProposalDetails">
        <Popup
          className="VotedInitiative__PopupVote"
          content={<div className="VotedInitiative__ChoiceTitle">{proposal.choices[choice - 1]}</div>}
          trigger={
            <div className="VotedInitiative__Vote">
              {t('modal.vp_delegation.details.stats_initiatives_voted')}
              <span className="VotedInitiative__Vote--highlight">{proposal.choices[choice - 1]}</span>
            </div>
          }
        />
      </div>
    </Link>
  )
}

export default VotedInitiative
