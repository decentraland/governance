import React, { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { Vote } from '../../entities/Votes/types'
import { calculateResultWinner } from '../../entities/Votes/utils'
import locations from '../../modules/locations'
import CategoryPill from '../Category/CategoryPill'
import ChoiceProgress from '../Status/ChoiceProgress'
import CoauthorRequestLabel from '../Status/CoauthorRequestLabel'
import StatusPill from '../Status/StatusPill'

import './ProposalCard.css'

export type ProposalCardProps = {
  proposal: ProposalAttributes
  coauthorRequest?: boolean
  votes?: Record<string, Vote> | null
  subscribed?: boolean
  subscribing?: boolean
  onSubscribe?: (e: React.MouseEvent<unknown>, proposal: ProposalAttributes) => void
}

const subscribeIcon = require('../../images/icons/subscribe.svg').default
const subscribedIcon = require('../../images/icons/subscribed.svg').default

export default function ProposalCard({
  proposal,
  subscribing,
  subscribed,
  votes,
  coauthorRequest,
  onSubscribe,
}: ProposalCardProps) {
  const t = useFormatMessage()
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
      className={TokenList.join([
        'ProposalCard',
        subscribed && 'ProposalCard--subscribed',
        coauthorRequest && 'ProposalCard--coauthor',
      ])}
    >
      <Card.Content className="ProposalCard__Content">
        <div className="ProposalCard__Title">
          <Header>{proposal.title}</Header>
          {account && (
            <Button basic onClick={handleSubscription} loading={subscribing} disabled={subscribing}>
              <img src={subscribed ? subscribedIcon : subscribeIcon} width="20" height="20" />
            </Button>
          )}
        </div>
        <div className="ProposalCard__Spacer" />
        <div className="ProposalCard__Progress">
          <Header sub>{t('page.proposal_detail.result_label')}</Header>
          <ChoiceProgress {...winner} />
        </div>
      </Card.Content>
      <Card.Content>
        <div className="ProposalCard__Info">
          <StatusPill status={proposal.status} />
          <CategoryPill type={proposal.type} />
        </div>
        {coauthorRequest && <CoauthorRequestLabel />}
      </Card.Content>
    </Card>
  )
}
