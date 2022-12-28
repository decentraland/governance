import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { AsyncStateResultState } from 'decentraland-gatsby/dist/hooks/useAsyncState'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import { DelegationResult, DetailedScores, VpDistribution } from '../../clients/SnapshotGraphqlTypes'
import { isSameAddress } from '../../entities/Snapshot/utils'
import DelegationCards from '../Delegation/DelegationCards'
import VotingPowerDelegationHandler from '../Modal/VotingPowerDelegationDetail/VotingPowerDelegationHandler'

import { ProfileBox } from './ProfileBox'
import './VpDelegatorsBox.css'

interface Props {
  address: string | null
  delegation: DelegationResult
  delegationState: AsyncStateResultState<DelegationResult, DelegationResult>
  scores: DetailedScores
  isLoadingScores: boolean
  loggedUserVpDistribution: VpDistribution | null
  isLoadingVpDistribution: boolean
  isLoggedUserProfile: boolean
}

export default function VpDelegatorsBox({
  address,
  delegation,
  delegationState,
  scores,
  isLoadingScores,
  loggedUserVpDistribution,
  isLoadingVpDistribution,
  isLoggedUserProfile,
}: Props) {
  const t = useFormatMessage()

  return (
    <Container>
      <ProfileBox
        className="VpDelegatorsBox"
        title={t('page.profile.delegators.title')}
        info={t('page.profile.delegators.helper')}
        action={
          !isLoggedUserProfile &&
          address &&
          !isLoadingVpDistribution &&
          loggedUserVpDistribution && (
            <VotingPowerDelegationHandler
              basic
              buttonText={t('page.profile.delegators.delegate_action')}
              userVP={loggedUserVpDistribution.own}
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
