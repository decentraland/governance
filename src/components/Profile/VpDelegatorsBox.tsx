import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { AsyncStateResultState } from 'decentraland-gatsby/dist/hooks/useAsyncState'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import { DelegationResult, DetailedScores, VpDistribution } from '../../clients/SnapshotGraphqlTypes'
import DelegationCards from '../Delegation/DelegationCards'
import VotingPowerDelegationHandler from '../Modal/VotingPowerDelegationDetail/VotingPowerDelegationHandler'

import { ProfileBox } from './ProfileBox'

interface Props {
  address: string | null
  delegation: DelegationResult
  delegationState: AsyncStateResultState<DelegationResult, DelegationResult>
  scores: DetailedScores
  isLoadingScores: boolean
  vpDistribution: VpDistribution | null
}

export default function VpDelegatorsBox({
  address,
  delegation,
  delegationState,
  scores,
  isLoadingScores,
  vpDistribution,
}: Props) {
  const t = useFormatMessage()
  const [userAddress] = useAuthContext()
  const isLoggedUserProfile = userAddress === address

  return (
    <Container>
      <ProfileBox
        title={t('page.profile.delegators.title')}
        info={t('page.profile.delegators.helper')}
        action={
          !isLoggedUserProfile &&
          address &&
          vpDistribution && (
            <VotingPowerDelegationHandler
              basic
              buttonText={t('page.profile.delegators.delegate_action')}
              userVP={vpDistribution.own}
              candidateAddress={address}
            />
          )
        }
      >
        <DelegationCards
          delegation={delegation}
          scores={scores}
          isLoading={delegationState.loading || isLoadingScores}
          isUserProfile={isLoggedUserProfile}
        />
      </ProfileBox>
    </Container>
  )
}
