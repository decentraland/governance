import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { VotedProposal } from '../../entities/Votes/types'
import locations from '../../modules/locations'
import CategoryPill from '../Category/CategoryPill'
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
          <Mobile>
            <div>
              <ResultStance isMatch={isMatch} isProposalActive={isProposalActive} />
            </div>
          </Mobile>
          <div className="ProfileProposalItem__Status">
            <StatusPill className="ProfileProposalItem__StatusPill" size="small" status={proposal.status} />
            {proposal.type && <CategoryPill type={proposal.type} />}
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
        <NotMobile>
          <ResultStance isMatch={isMatch} isProposalActive={isProposalActive} />
        </NotMobile>
        <ChevronRightCircleOutline size={24} />
      </Card.Content>
    </Card>
  )
}

export default ProfileProposalItem
