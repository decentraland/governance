import React from 'react'

import { Link } from '@reach/router'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalAttributes, ProposalStatus } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import { useProposalDateText } from '../../hooks/useProposalDateText'
import useProposalVotes from '../../hooks/useProposalVotes'
import { abbreviateTimeDifference } from '../../utils/date/Time'
import locations from '../../utils/locations'
import CategoryPill from '../Category/CategoryPill'
import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'
import StatusPill from '../Status/StatusPill'

import CoAuthorPill from './CoAuthorPill'
import './ProposalCreatedItem.css'

interface Props {
  proposal: ProposalAttributes
  showCoauthoring?: boolean
  hasCoauthorRequests?: boolean
}

function ProposalCreatedItem({ proposal, showCoauthoring, hasCoauthorRequests }: Props) {
  const t = useFormatMessage()
  const { start_at, finish_at, title, status, type, id } = proposal
  const dateText = useProposalDateText(start_at, finish_at)
  const { votes } = useProposalVotes(proposal.id)

  return (
    <Card as={Link} href={locations.proposal(id)} className="ProposalCreatedItem">
      <Card.Content>
        <div>
          <div className="ProposalCreatedItem__Title">
            <Header>{title}</Header>
          </div>
          <div className="ProposalCreatedItem__Status">
            <StatusPill className="ProposalCreatedItem__StatusPill" size="small" status={status} />
            {showCoauthoring && (
              <CoAuthorPill className="ProposalCreatedItem__CoAuthorPill" hasCoauthorRequests={hasCoauthorRequests} />
            )}
            <Mobile>
              {type && <CategoryPill className="ProposalCreatedItem__CategoryPill" size="small" proposalType={type} />}
            </Mobile>
            <div className="ProposalCreatedItem__Stats">
              <span className="ProposalCreatedItem__Details">
                {t('page.profile.created_proposals.votes', { total: Object.keys(votes || {}).length })}
              </span>
              <span className="ProposalCreatedItem__Details">
                <Mobile>{abbreviateTimeDifference(dateText)}</Mobile>
                <NotMobile>{dateText}</NotMobile>
              </span>
            </div>
          </div>
        </div>
        <div className="ProposalCreatedItem__CategorySectionContainer">
          <NotMobile>
            <div className="ProposalCreatedItem__CategorySection">
              {type && (
                <div className="ProposalCreatedItem__CategoryPillContainer">
                  <CategoryPill size="small" proposalType={type} />
                </div>
              )}
              {proposal.status === ProposalStatus.Active && (
                <span className="ProposalCreatedItem__VoteText">{t('page.home.open_proposals.vote')}</span>
              )}
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

export default ProposalCreatedItem
