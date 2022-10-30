import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import useVotedProposals from '../../hooks/useVotedProposals'
import FullWidthButton from '../Common/FullWidthButton'
import SkeletonBars from '../Common/SkeletonBars'
import ProfileProposalItem from '../Proposal/ProfileProposalItem'

import { ProfileBox } from './ProfileBox'
import './VotedProposalsBox.css'

interface Props {
  address: string
}

const PROPOSALS_PER_PAGE = 5

function VotedProposalsBox({ address }: Props) {
  const t = useFormatMessage()

  const { votes, isLoading, handleViewMore, areMoreProposals } = useVotedProposals(address, PROPOSALS_PER_PAGE)

  return (
    <Container className="VotedProposalsBox">
      <ProfileBox title={t('page.profile.voted_proposals.title')}>
        {isLoading && <SkeletonBars amount={votes.length || 3} height={89} />}
        {!isLoading &&
          votes.map((vote) => {
            return <ProfileProposalItem key={vote.id} votedProposal={vote} />
          })}
        {areMoreProposals && (
          <FullWidthButton onClick={handleViewMore}>{t('page.profile.voted_proposals.button')}</FullWidthButton>
        )}
      </ProfileBox>
    </Container>
  )
}

export default VotedProposalsBox
