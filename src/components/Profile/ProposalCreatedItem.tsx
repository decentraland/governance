import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalAttributes, ProposalStatus } from '../../entities/Proposal/types'
import useProposalVotes from '../../hooks/useProposalVotes'
import locations from '../../modules/locations'
import { abbreviateTimeDifference } from '../../modules/time'
import CategoryPill from '../Category/CategoryPill'
import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'
import StatusPill from '../Status/StatusPill'

import './ProposalCreatedItem.css'

interface Props {
  proposal: ProposalAttributes
}

function ProposalCreatedItem({ proposal }: Props) {
  const t = useFormatMessage()
  const { finish_at, title, status, type, id } = proposal
  const dateText = t(`page.home.open_proposals.${Time().isBefore(Time(finish_at)) ? 'ends_date' : 'ended_date'}`, {
    value: Time(finish_at).fromNow(),
  })

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
            <Mobile>
              {type && <CategoryPill className="ProposalCreatedItem__CategoryPill" size="small" type={type} />}
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
                  <CategoryPill size="small" type={type} />
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
