import React, { useMemo } from 'react'
import { Card } from "decentraland-ui/dist/components/Card/Card"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { Link } from "gatsby-plugin-intl"
import locations from '../../modules/locations'
import StatusLabel from '../Status/StatusLabel'
import CategoryLabel from '../Category/CategoryLabel'
import { ProposalAttributes } from '../../entities/Proposal/types'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import './ProposalCard.css'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Vote } from '../../entities/Votes/types'
import { calculateResultWinner } from '../../entities/Votes/utils'
import ChoiceProgress from '../Status/ChoiceProgress'

export type ProposalCardProps = {
  proposal: ProposalAttributes,
  votes?: Record<string, Vote> | null,
  subscribed?: boolean,
  subscribing?: boolean,
  onSubscribe?: (e: React.MouseEvent<any>, proposal: ProposalAttributes) => void
}

const subscribeIcon = require('../../images/icons/subscribe.svg')
const subscribedIcon = require('../../images/icons/subscribed.svg')

export default function ProposalCard({ proposal, subscribing, subscribed, votes, onSubscribe }: ProposalCardProps) {
  const l = useFormatMessage()
  const [ account ] = useAuthContext()
  const choices = useMemo((): string[] => proposal?.snapshot_proposal?.choices || [], [ proposal ])
  const winner = useMemo(() => calculateResultWinner(choices, votes || {} /*, proposal?.required_to_pass || 0*/), [ proposal, account, choices, votes ])
  function handleSubscription(e: React.MouseEvent<any>) {
    e.stopPropagation()
    e.preventDefault()
    onSubscribe && onSubscribe(e, proposal)
  }

  return <Card as={Link} to={locations.proposal(proposal.id)} className={TokenList.join([
      "ProposalCard",
      subscribed && "ProposalCard--subscribed",
    ])
  }>
      <Card.Content className="ProposalCard__Content">
        <div className="ProposalCard__Title">
          <Header>{proposal.title}</Header>
          {account && <Button basic onClick={handleSubscription} loading={subscribing} disabled={subscribing}>
            <img src={subscribed ? subscribedIcon : subscribeIcon} width="20" height="20"/>
          </Button>}
        </div>
        <div className="ProposalCard__Progress">
          <Header sub>{l('page.proposal_detail.result_label')}</Header>
          <ChoiceProgress {...winner} />
        </div>
      </Card.Content>
      <Card.Content>
        <div>
          <StatusLabel status={proposal.status} />
          <CategoryLabel  type={proposal.type} />
        </div>
      </Card.Content>
    </Card>
}