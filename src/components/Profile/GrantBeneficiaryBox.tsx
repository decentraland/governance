import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import useGrantsByUser from '../../hooks/useGrantsByUser'
import GrantBeneficiaryList from '../Grants/GrantBeneficiaryList'

import './GrantBeneficiaryBox.css'
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
    <Container className="GrantBeneficiaryBox">
      <ProfileBox title={t('page.profile.grants.title')} info={t('page.profile.grants.info')}>
        <GrantBeneficiaryList grants={grants} />
      </ProfileBox>
    </Container>
  )
}
