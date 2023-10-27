import { DelegationResult, DetailedScores } from '../../clients/SnapshotTypes'
import { isSameAddress } from '../../entities/Snapshot/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import useVotingPowerInformation from '../../hooks/useVotingPowerInformation'
import DelegationCards from '../Delegation/DelegationCards'
import VotingPowerDelegationHandler from '../Modal/VotingPowerDelegationDetail/VotingPowerDelegationHandler'

import { ActionBox } from './ActionBox'
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
    <ActionBox
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
    </ActionBox>
  )
}
