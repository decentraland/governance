import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import useVotedProposals from '../../hooks/useVotedProposals'
import ProfileProposalItem from '../Proposal/ProfileProposalItem'

import { ProfileBox } from './ProfileBox'

interface Props {
  address: string
}

function VotedProposalsBox({ address }: Props) {
  const t = useFormatMessage()
  const [fetchInfo, setFetchInfo] = useState({ first: 5, skip: 0 })
  const { votes } = useVotedProposals(address, fetchInfo.first, fetchInfo.skip)
  return (
    <Container>
      <ProfileBox title={t('page.profile.voted_proposals.title')} info={t('page.profile.voted_proposals.helper')}>
        {votes.map((vote, index) => {
          return <ProfileProposalItem key={vote.id} votedProposal={vote} />
        })}
      </ProfileBox>
    </Container>
  )
}

export default VotedProposalsBox
