import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import { ProfileBox } from './ProfileBox'

function VotedProposalsBox() {
  const t = useFormatMessage()
  return (
    <Container>
      <ProfileBox title={t('page.profile.voted_proposals.title')} info={t('page.profile.voted_proposals.helper')}>
        <div>Proposals</div>
      </ProfileBox>
    </Container>
  )
}

export default VotedProposalsBox
