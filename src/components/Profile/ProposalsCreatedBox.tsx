import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import usePaginatedProposals from '../../hooks/usePaginatedProposals'
import Empty from '../Common/Empty'
import FullWidthButton from '../Common/FullWidthButton'
import SkeletonBars from '../Common/SkeletonBars'
import Watermelon from '../Icon/Watermelon'

import { ProfileBox } from './ProfileBox'
import ProposalCreatedItem from './ProposalCreatedItem'
import './ProposalsCreatedBox.css'

interface Props {
  address: string
}

const PROPOSALS_PER_PAGE = 5

function ProposalsCreatedBox({ address }: Props) {
  const t = useFormatMessage()

  const {
    proposals,
    isLoadingProposals: isLoading,
    loadMore,
    hasMoreProposals,
  } = usePaginatedProposals({
    user: address.toLowerCase(),
    itemsPerPage: PROPOSALS_PER_PAGE,
  })

  return (
    <Container>
      <ProfileBox title={t('page.profile.created_proposals.title')}>
        {isLoading && <SkeletonBars amount={proposals.length || PROPOSALS_PER_PAGE} height={89} />}
        {!isLoading &&
          (proposals && proposals.length > 0 ? (
            proposals.map((proposal) => <ProposalCreatedItem key={proposal.id} proposal={proposal} />)
          ) : (
            <Empty
              className="ProposalsCreatedBox__Empty"
              icon={<Watermelon />}
              description={t('page.profile.created_proposals.empty')}
            />
          ))}
        {hasMoreProposals && (
          <FullWidthButton onClick={loadMore}>{t('page.profile.created_proposals.button')}</FullWidthButton>
        )}
      </ProfileBox>
    </Container>
  )
}

export default ProposalsCreatedBox
