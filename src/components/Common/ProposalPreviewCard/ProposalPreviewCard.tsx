import { useState } from 'react'

import classNames from 'classnames'
import { Desktop, TabletAndBelow } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { Vote } from '../../../entities/Votes/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useProposalComments from '../../../hooks/useProposalComments'
import Time from '../../../utils/date/Time'
import locations from '../../../utils/locations'
import CategoryPill from '../../Category/CategoryPill'
import Link from '../../Common/Typography/Link'
import Username from '../../Common/Username'
import ChevronRight from '../../Icon/ChevronRight'
import Heading from '../Typography/Heading'

import CategoryModule from './CategoryModule'
import './ProposalPreviewCard.css'
import ProposalPreviewCardSection from './ProposalPreviewCardSection'
import VoteModule from './VoteModule'

enum Variant {
  Vote = 'vote',
  Category = 'category',
}

interface Props {
  proposal: ProposalAttributes
  votes?: Record<string, Vote>
  variant: `${Variant}`
}

const ProposalPreviewCard = ({ proposal, votes, variant }: Props) => {
  const t = useFormatMessage()
  const { title, user, finish_at } = proposal
  const { comments } = useProposalComments(proposal.id)
  const dateText = t(`page.home.open_proposals.${Time().isBefore(Time(finish_at)) ? 'ends_date' : 'ended_date'}`, {
    value: Time(finish_at).fromNow(),
  })
  const [isHovered, setisHovered] = useState(false)

  return (
    <Link
      className={classNames('ProposalPreviewCard', `ProposalPreviewCard--${variant}`)}
      href={locations.proposal(proposal.id)}
      onMouseEnter={() => setisHovered(true)}
      onMouseLeave={() => setisHovered(false)}
    >
      <ProposalPreviewCardSection>
        <Username className="ProposalPreviewCard__Avatar" address={user} variant="avatar" size="medium" />
        <div className="ProposalPreviewCard__TextContainer">
          <Heading as="h3" size="xs" weight="semi-bold" className="ProposalPreviewCard__Title">
            {title}
          </Heading>
          <span className="ProposalPreviewCard__Details">
            <TabletAndBelow>
              <CategoryPill className="ProposalPreviewCard__Pill" proposalType={proposal.type} size="sm" />
            </TabletAndBelow>
            <span className="ProposalPreviewCard__DetailsItem ProposalPreviewCard__UsernameContainer">
              {t('page.home.open_proposals.by_user')}
              <Username className="ProposalPreviewCard__Username" address={user} variant="address" />
            </span>
            <Desktop>
              <span className="ProposalPreviewCard__DetailsItem">
                {t('page.home.open_proposals.votes', { total: Object.keys(votes || {}).length })}
              </span>
              <span className="ProposalPreviewCard__DetailsItem">
                {t('page.home.open_proposals.comments', { total: comments?.totalComments || 0 })}
              </span>
            </Desktop>
            <span className="ProposalPreviewCard__DetailsItem">{dateText}</span>
          </span>
        </div>
      </ProposalPreviewCardSection>
      {variant === Variant.Vote && <VoteModule proposal={proposal} votes={votes} />}
      {variant === Variant.Category && <CategoryModule proposal={proposal} isHovered={isHovered} />}
      <TabletAndBelow>
        <div>
          <ChevronRight color="var(--black-400)" />
        </div>
      </TabletAndBelow>
    </Link>
  )
}

export default ProposalPreviewCard
