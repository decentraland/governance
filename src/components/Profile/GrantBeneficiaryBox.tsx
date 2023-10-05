import React from 'react'

import { Container } from 'decentraland-ui/dist/components/Container/Container'

import useFormatMessage from '../../hooks/useFormatMessage'
import useGrantsByUser from '../../hooks/useGrantsByUser'

import GrantBeneficiaryList from './GrantBeneficiaryList'
import { ProfileBox } from './ProfileBox'

interface Props {
  address: string | null
}

export default function GrantBeneficiaryBox({ address }: Props) {
  const t = useFormatMessage()
  const grants = useGrantsByUser(address, true)
  const hasGrants = grants.length > 0

  if (!hasGrants) return null

  return (
    <Container fluid className="GrantBeneficiaryBox">
      <ProfileBox title={t('page.profile.grants.title')} info={t('page.profile.grants.info')}>
        <GrantBeneficiaryList grants={grants} />
      </ProfileBox>
    </Container>
  )
}
