import React, { useMemo } from 'react'

import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Desktop } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { Vote } from '../../entities/Votes/types'
import { calculateResultWinner } from '../../entities/Votes/utils'
import locations from '../../utils/locations'
import CategoryPill from '../Category/CategoryPill'
import Subscribe from '../Icon/Subscribe'
import Subscribed from '../Icon/Subscribed'
import CoauthorRequestLabel from '../Status/CoauthorRequestLabel'
import FinishLabel from '../Status/FinishLabel'
import LeadingOption from '../Status/LeadingOption'
import StatusPill from '../Status/StatusPill'
import Username from '../User/Username'

import './ProposalItem.css'

interface Props {
  proposal: ProposalAttributes
  hasCoauthorRequest?: boolean
  votes?: Record<string, Vote>
  subscribed?: boolean
  subscribing?: boolean
  onSubscribe?: (e: React.MouseEvent<unknown>, proposal: ProposalAttributes) => void
}

export default function ProposalItem({
  proposal,
  hasCoauthorRequest,
  votes,
  subscribing,
  subscribed,
  onSubscribe,
}: Props) {
  const [account] = useAuthContext()
  const choices = useMemo((): string[] => proposal?.snapshot_proposal?.choices || [], [proposal])
  const winner = useMemo(() => calculateResultWinner(choices, votes || {}), [choices, votes])
  const t = useFormatMessage()
  function handleSubscription(e: React.MouseEvent<unknown>) {
    e.stopPropagation()
    e.preventDefault()
    onSubscribe && onSubscribe(e, proposal)
  }

  const userVote = account ? votes?.[account] : null
  const userChoice = userVote?.choice ? choices?.[userVote.choice - 1] : null

  return (
    <Card
      as={Link}
      href={locations.proposal(proposal.id)}
      className={classNames(
        'ProposalItem',
        subscribed && 'ProposalItem--subscribed',
        hasCoauthorRequest && 'ProposalItem--coauthor'
      )}
    >
      <Card.Content>
        <div className="ProposalItem__Title">
          <Header>{proposal.title}</Header>
          {hasCoauthorRequest && <CoauthorRequestLabel />}
          {account && (
            <Button basic onClick={handleSubscription} loading={subscribing} disabled={subscribing}>
              {subscribed ? <Subscribed size="20" /> : <Subscribe size="20" />}
            </Button>
          )}
        </div>
        <div className="ProposalItem__Status">
          <div className="ProposalItem__Details">
            <StatusPill status={proposal.status} />
            <CategoryPill proposalType={proposal.type} />
            <Username address={proposal.user} variant="avatar" />
            <div className="ProposalItem__Stats">
              {votes && (
                <Desktop>
                  <span className="ProposalItem__Votes">
                    {t('page.proposal_list.votes', { total: Object.keys(votes).length })}
                  </span>
                </Desktop>
              )}
              <FinishLabel startAt={proposal.start_at} finishAt={proposal.finish_at} />
            </div>
          </div>
          {winner.votes > 0 && (
            <Desktop>
              <LeadingOption
                status={proposal.status}
                leadingOption={winner.choice}
                metVP={winner.power >= (proposal.required_to_pass || 0)}
                userChoice={userChoice}
              />
            </Desktop>
          )}
        </div>
      </Card.Content>
    </Card>
  )
}
