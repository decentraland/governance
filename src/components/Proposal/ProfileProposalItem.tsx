import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { VotedProposal } from '../../entities/Votes/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import CategoryPill from '../Category/CategoryPill'
import Link from '../Common/Typography/Link'
import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'
import StatusPill from '../Status/StatusPill'

import './ProfileProposalItem.css'
import ResultStance from './ResultStance'

interface Props {
  votedProposal: VotedProposal
}

function ProfileProposalItem({ votedProposal }: Props) {
  const t = useFormatMessage()
  const { proposal } = votedProposal
  const choiceIdx = votedProposal.choice - 1
  const { choices, finish_at, scores } = proposal
  const dateText = t(`page.home.open_proposals.${Time().isBefore(Time(finish_at)) ? 'ends_date' : 'ended_date'}`, {
    value: Time(finish_at).fromNow(),
  })
  const maxScore = Math.max(...scores)
  const winningChoice = scores.indexOf(maxScore)
  const isMatch = winningChoice === choiceIdx
  const isProposalActive = Time().isBefore(Time(finish_at))

  return (
    <Card as={Link} href={locations.proposal(proposal.proposal_id)} className="ProfileProposalItem">
      <Card.Content>
        <div>
          <div className="ProfileProposalItem__Title">
            <Header>{proposal.title}</Header>
          </div>
          <div className="ProfileProposalItem__Status">
            <StatusPill className="ProfileProposalItem__Pill" size="sm" status={proposal.status} />
            {proposal.type && (
              <CategoryPill className="ProfileProposalItem__Pill" size="sm" proposalType={proposal.type} />
            )}
            <NotMobile>
              <div className="ProfileProposalItem__Stats">
                <span className="ProfileProposalItem__Details ">
                  <span className="ProfileProposalItem__Choice">
                    {t('page.profile.voted_proposals.vote', { vote: choices[choiceIdx] })}
                  </span>
                </span>
                <span className="ProfileProposalItem__Details">{dateText}</span>
              </div>
            </NotMobile>
          </div>
        </div>
        <div className="ProfileProposalItem__ResultSectionContainer">
          <NotMobile>
            <div className="ProfileProposalItem__ResultSection">
              <ResultStance isMatch={isMatch} isProposalActive={isProposalActive} />
              <ChevronRightCircleOutline />
            </div>
          </NotMobile>
          <Mobile>
            <ChevronRightCircleOutline />
          </Mobile>
        </div>
      </Card.Content>
    </Card>
  )
}

export default ProfileProposalItem
