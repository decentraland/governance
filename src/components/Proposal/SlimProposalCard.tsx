import { useState } from 'react'

import classNames from 'classnames'
import { TabletAndBelow } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalAttributes } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import CategoryPill from '../Category/CategoryPill'
import CategoryModule from '../Common/ProposalPreviewCard/CategoryModule'
import ProposalPreviewCardSection from '../Common/ProposalPreviewCard/ProposalPreviewCardSection'
import Heading from '../Common/Typography/Heading'
import Link from '../Common/Typography/Link'
import ChevronRight from '../Icon/ChevronRight'

import './SlimProposalCard.css'

interface Props {
  proposal: ProposalAttributes
}

const SlimProposalCard = ({ proposal }: Props) => {
  const t = useFormatMessage()
  const { title, finish_at } = proposal
  const isProposalActive = Time().isBefore(Time(finish_at))
  const dateText = t(`page.home.open_proposals.${isProposalActive ? 'ends_date' : 'ended_date'}`, {
    value: Time(finish_at).fromNow(),
  })
  const [isHovered, setIsHovered] = useState(false)
  const isProposalAboutToEnd = isProposalActive && Time(finish_at).diff(Time(), 'hours') < 24

  return (
    <Link
      className={classNames('ProposalPreviewCard', 'ProposalPreviewCard--slim')}
      href={locations.proposal(proposal.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ProposalPreviewCardSection>
        <div className="ProposalPreviewCard__TextContainer">
          <Heading as="h3" size="xs" weight="semi-bold" className="ProposalPreviewCard__Title">
            {title}
          </Heading>
          <span className="ProposalPreviewCard__Details">
            <TabletAndBelow>
              <CategoryPill className="ProposalPreviewCard__Pill" proposalType={proposal.type} size="sm" />
            </TabletAndBelow>
            <span
              className={classNames(
                'ProposalPreviewCard__DetailsItem',
                isProposalAboutToEnd && 'ProposalPreviewCard__DetailsItem--highlight'
              )}
            >
              {dateText}
            </span>
          </span>
        </div>
      </ProposalPreviewCardSection>
      <CategoryModule proposal={proposal} isHovered={isHovered} slim />
    </Link>
  )
}

export default SlimProposalCard
