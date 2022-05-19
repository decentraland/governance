import React, { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { Vote } from '../../entities/Votes/types'
import { calculateResultWinner } from '../../entities/Votes/utils'
import locations from '../../modules/locations'
import CategoryLabel from '../Category/CategoryLabel'
import FinishLabel from '../Status/FinishLabel'
import LeadingOption from '../Status/LeadingOption'
import StatusLabel from '../Status/StatusLabel'

import './ProposalItem.css'

export type ProposalItemProps = {
  proposal: ProposalAttributes
  votes?: Record<string, Vote>
  subscribed?: boolean
  subscribing?: boolean
  onSubscribe?: (e: React.MouseEvent<unknown>, proposal: ProposalAttributes) => void
}

const subscribeIcon = require('../../images/icons/subscribe.svg').default
const subscribedIcon = require('../../images/icons/subscribed.svg').default

export default function ProposalItem({ proposal, votes, subscribing, subscribed, onSubscribe }: ProposalItemProps) {
  const [account] = useAuthContext()
  const choices = useMemo((): string[] => proposal?.snapshot_proposal?.choices || [], [proposal])
  const winner = useMemo(() => calculateResultWinner(choices, votes || {}), [choices, votes])
  function handleSubscription(e: React.MouseEvent<unknown>) {
    e.stopPropagation()
    e.preventDefault()
    onSubscribe && onSubscribe(e, proposal)
  }
  return (
    <Card
      as={Link}
      href={locations.proposal(proposal.id)}
      className={TokenList.join(['ProposalItem', subscribed && 'ProposalItem--subscribed'])}
    >
      <Card.Content>
        <div className="ProposalItem__Title">
          <Header>{proposal.title}</Header>
          {account && (
            <Button basic onClick={handleSubscription} loading={subscribing} disabled={subscribing}>
              <img src={subscribed ? subscribedIcon : subscribeIcon} width="20" height="20" />
            </Button>
          )}
          {winner.votes > 0 && (
            <LeadingOption
              status={proposal.status}
              leadingOption={winner.choice}
              metVP={winner.power >= (proposal.required_to_pass || 0)}
            />
          )}
        </div>
        <div className="ProposalItem__Status">
          <div>
            <StatusLabel status={proposal.status} />
            <CategoryLabel type={proposal.type} />
          </div>
          <FinishLabel date={proposal.finish_at} />
        </div>
      </Card.Content>
    </Card>
  )
}
