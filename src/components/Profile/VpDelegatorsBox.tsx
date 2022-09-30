import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import useVotingPowerInformation from '../../hooks/useVotingPowerInformation'
import DelegationCards from '../Delegation/DelegationCards'
import VotingPowerDelegationHandler from '../Modal/VotingPowerDelegationDetail/VotingPowerDelegationHandler'

import { ProfileBox } from './ProfileBox'

interface Props {
  address: string | null
}

export default function VpDelegatorsBox({ address }: Props) {
  const t = useFormatMessage()
  const [userAddress, authState] = useAuthContext()
  const isLoggedUserProfile = userAddress === address
  const { delegation, delegationState, scores, isLoadingScores, vpDistribution, isLoadingVpDistribution } =
    useVotingPowerInformation(address)

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
