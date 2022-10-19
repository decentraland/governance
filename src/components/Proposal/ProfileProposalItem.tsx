import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Desktop } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { Vote, VotedProposal } from '../../entities/Votes/types'
import { calculateResultWinner } from '../../entities/Votes/utils'
import locations from '../../modules/locations'
import CategoryPill from '../Category/CategoryPill'
import CoauthorRequestLabel from '../Status/CoauthorRequestLabel'
import FinishLabel from '../Status/FinishLabel'
import LeadingOption from '../Status/LeadingOption'
import StatusPill from '../Status/StatusPill'
import Username from '../User/Username'

import './ProfileProposalItem.css'

interface Props {
  votedProposal: VotedProposal
}

function ProfileProposalItem({ votedProposal }: Props) {
  const { proposal } = votedProposal
  console.log('proposal', proposal)
  return (
    <Card as={Link} href={locations.proposal(proposal.proposal_id)} className="ProfileProposalItem">
      <Card.Content>
        <div className="ProfileProposalItem__Title">
          <Header>{proposal.title}</Header>
        </div>
        <div className="ProfileProposalItem__Status">
          <div className="ProfileProposalItem__Details">
            <StatusPill status={proposal.status} />
            <CategoryPill type={proposal.type} />
            <Username address={proposal.author} variant="avatar" />
            <div className="ProfileProposalItem__Stats">
              {/* {votes && (
                <Desktop>
                  <span className="ProfileProposalItem__Votes">
                    {t('page.proposal_list.votes', { total: Object.keys(votes).length })}
                  </span>
                </Desktop>
              )} */}
              {/* <FinishLabel date={proposal.finish_at} /> */}
            </div>
          </div>
          {/* {winner.votes > 0 && (
            <Desktop>
              <LeadingOption
                status={proposal.status}
                leadingOption={winner.choice}
                metVP={winner.power >= (proposal.required_to_pass || 0)}
                userChoice={userChoice}
              />
            </Desktop>
          )} */}
        </div>
      </Card.Content>
    </Card>
  )
}

export default ProfileProposalItem
