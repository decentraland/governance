import React from 'react'

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
  profileAddress: string | null
  userAddress: string | null
  delegation: DelegationResult
  isLoadingDelegation: boolean
  scores: DetailedScores
  isLoadingScores: boolean
}

export default function VpDelegatorsBox({
  profileAddress,
  userAddress,
  delegation,
  isLoadingDelegation,
  scores,
  isLoadingScores,
}: Props) {
  const t = useFormatMessage()
  const isLoggedUserProfile = isSameAddress(userAddress, profileAddress)
  const { vpDistribution: loggedUserVpDistribution, isLoadingVpDistribution: isLoadingUserVpDistribution } =
    useVotingPowerInformation(!isLoggedUserProfile ? userAddress : undefined)
  const { delegatedFrom } = delegation
  const accountHasDelegations = delegatedFrom.length > 0

  const displayDelegateAction =
    !isLoggedUserProfile && !isLoadingUserVpDistribution && profileAddress && accountHasDelegations

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
              userVP={loggedUserVpDistribution?.own}
              candidateAddress={profileAddress}
            />
          )
        }
      >
        {loggedUserVpDistribution && profileAddress && (
          <DelegationCards
            delegation={delegation}
            scores={scores}
            isLoading={isLoadingDelegation || isLoadingScores}
            isUserProfile={isLoggedUserProfile}
            loggedUserVpDistribution={loggedUserVpDistribution}
            profileAddress={profileAddress}
          />
        )}
      </ProfileBox>
    </Container>
  )
}
