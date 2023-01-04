import React, { useMemo } from 'react'

import { AsyncStateResultState } from 'decentraland-gatsby/dist/hooks/useAsyncState'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import { DelegationResult, DetailedScores } from '../../clients/SnapshotGraphqlTypes'
import { isSameAddress } from '../../entities/Snapshot/utils'
import useVotingPowerInformation from '../../hooks/useVotingPowerInformation'
import DelegationCards from '../Delegation/DelegationCards'
import VotingPowerDelegationHandler from '../Modal/VotingPowerDelegationDetail/VotingPowerDelegationHandler'

import { ProfileBox } from './ProfileBox'
import './VpDelegatorsBox.css'

interface Props {
  address: string | null
  userAddress: string | null
  delegation: DelegationResult
  delegationState: AsyncStateResultState<DelegationResult, DelegationResult>
  scores: DetailedScores
  isLoadingScores: boolean
}

export default function VpDelegatorsBox({
  address,
  userAddress,
  delegation,
  delegationState,
  scores,
  isLoadingScores,
}: Props) {
  const t = useFormatMessage()
  const isLoggedUserProfile = isSameAddress(userAddress, address)
  const { vpDistribution: loggedUserVpDistribution, isLoadingVpDistribution } = useVotingPowerInformation(
    !isLoggedUserProfile ? userAddress : undefined
  )
  const { delegatedFrom } = delegation
  const userHasDelegatedToThisProfile = useMemo(
    () => delegatedFrom.some((delegation) => isSameAddress(delegation.delegator, userAddress)),
    [delegatedFrom, userAddress]
  )
  const displayDelegateAction =
    !isLoggedUserProfile &&
    address &&
    !isLoadingVpDistribution &&
    loggedUserVpDistribution &&
    !userHasDelegatedToThisProfile

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
