import React, { useEffect, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import useVotedProposals from '../../hooks/useVotedProposals'
import FullWidthButton from '../Common/FullWidthButton'
import ProfileProposalItem from '../Proposal/ProfileProposalItem'

import { ProfileBox } from './ProfileBox'
import './VotedProposalsBox.css'

interface Props {
  address: string
}

const PROPOSALS_AMOUNT = 5

function VotedProposalsBox({ address }: Props) {
  const t = useFormatMessage()
  const [skip, setSkip] = useState(0)
  const { votes } = useVotedProposals(address, PROPOSALS_AMOUNT, skip)
  const [displayVotes, setDisplayVotes] = useState(votes)
  useEffect(() => {
    if (votes.length > 0) {
      setDisplayVotes((prev) => [...prev, ...votes])
    }
  }, [votes])

  const handleViewMore = () => setSkip((prev) => prev + PROPOSALS_AMOUNT)

  return (
    <Container className="VotedProposalsBox">
      <ProfileBox title={t('page.profile.voted_proposals.title')} info={t('page.profile.voted_proposals.helper')}>
        {displayVotes.map((vote) => {
          return <ProfileProposalItem key={vote.id} votedProposal={vote} />
        })}
        {votes.length === PROPOSALS_AMOUNT && (
          <FullWidthButton onClick={handleViewMore}>{t('page.profile.voted_proposals.button')}</FullWidthButton>
        )}
      </ProfileBox>
    </Container>
  )
}

export default VotedProposalsBox
