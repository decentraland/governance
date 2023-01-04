import React, { useMemo } from 'react'

import { AsyncStateResultState } from 'decentraland-gatsby/dist/hooks/useAsyncState'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import { DelegationResult, DetailedScores } from '../../clients/SnapshotGraphqlTypes'
import { isSameAddress } from '../../entities/Snapshot/utils'
import useVotingPowerInformation from '../../hooks/useVotingPowerInformation'
import DelegationCards from '../Delegation/DelegatedToUserEmpty'
import VotingPowerDelegationHandler from '../Modal/VotingPowerDelegationDetail/VotingPowerDelegationHandler'

import { ProfileBox } from './ProfileBox'
import './VpDelegatorsBox.css'

interface Props {
  profileAddress: string | null
  userAddress: string | null
  delegation: DelegationResult
  delegationState: AsyncStateResultState<DelegationResult, DelegationResult>
  scores: DetailedScores
  isLoadingScores: boolean
}

export default function VpDelegatorsBox({
  profileAddress,
  userAddress,
  delegation,
  delegationState,
  scores,
  isLoadingScores,
}: Props) {
  const t = useFormatMessage()
  const isLoggedUserProfile = isSameAddress(userAddress, profileAddress)
  const { vpDistribution: loggedUserVpDistribution, isLoadingVpDistribution } = useVotingPowerInformation(
    !isLoggedUserProfile ? userAddress : undefined
  )
  const { delegatedFrom } = delegation
  const userHasDelegatedToThisProfile = useMemo(
    () => delegatedFrom.some((delegation) => isSameAddress(delegation.delegator, userAddress)),
    [delegatedFrom, userAddress]
  )
  const accountHasDelegations = delegatedFrom.length > 0

  const displayDelegateAction =
    !isLoggedUserProfile &&
    profileAddress &&
    !isLoadingVpDistribution &&
    loggedUserVpDistribution &&
    !userHasDelegatedToThisProfile &&
    accountHasDelegations

  return (
    <Container>
      <ProfileBox
        className="VpDelegatorsBox"
        title={t('page.profile.delegators.title')}
        info={t('page.profile.delegators.helper')}
        action={
          displayDelegateAction && (
            <VotingPowerDelegationHandler
              basic
              buttonText={t('page.profile.delegators.delegate_action')}
              userVP={loggedUserVpDistribution.own}
              candidateAddress={profileAddress}
            />
          )
        }
      >
        {loggedUserVpDistribution && profileAddress && (
          <DelegationCards
            delegation={delegation}
            scores={scores}
            isLoading={delegationState.loading || isLoadingScores}
            isUserProfile={isLoggedUserProfile}
            loggedUserVpDistribution={loggedUserVpDistribution}
            profileAddress={profileAddress}
          />
        )}
      </ProfileBox>
    </Container>
  )
}
