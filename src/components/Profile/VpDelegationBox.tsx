import { useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { DelegationResult } from '../../clients/SnapshotTypes'
import { isSameAddress } from '../../entities/Snapshot/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import useVotingPowerDistribution from '../../hooks/useVotingPowerDistribution'
import { ActionBox } from '../Common/ActionBox'
import Empty, { ActionType } from '../Common/Empty'
import SkeletonBars from '../Common/SkeletonBars'
import DelegatorCardProfile from '../Delegation/DelegatorCardProfile'
import Scale from '../Icon/Scale'
import { Candidate } from '../Modal/VotingPowerDelegationModal/VotingPowerDelegationCandidatesList'
import VotingPowerDelegationModal from '../Modal/VotingPowerDelegationModal/VotingPowerDelegationModal'

interface Props {
  address: string | null
  delegation: DelegationResult
  isLoadingDelegation: boolean
  ownVp: number | undefined
  isLoadingOwnVp: boolean
}

function VpDelegationBox({ address, delegation, isLoadingDelegation, ownVp, isLoadingOwnVp }: Props) {
  const t = useFormatMessage()
  const [userAddress] = useAuthContext()
  const isLoggedUserProfile = isSameAddress(userAddress, address)
  const isLoading = isLoadingDelegation || isLoadingOwnVp
  const { delegatedTo } = delegation
  const [openDelegationModal, setOpenDelegationModal] = useState(false)
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(address)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const profileHasADelegation = delegatedTo.length > 0 && !!ownVp

  return (
    <div>
      <ActionBox
        title={t('page.profile.delegation.title')}
        info={t('page.profile.delegation.helper')}
        action={
          profileHasADelegation &&
          isLoggedUserProfile && (
            <Button basic onClick={() => setOpenDelegationModal(true)}>
              {t('page.profile.delegation.change_delegation')}
            </Button>
          )
        }
      >
        {isLoading && <SkeletonBars amount={1} height={70} />}
        {!isLoading && (
          <>
            {profileHasADelegation ? (
              <Grid columns={3} stackable>
                {delegatedTo.map(({ delegate }) => (
                  <Grid.Column key={delegate}>
                    <DelegatorCardProfile address={delegate} vp={ownVp} />
                  </Grid.Column>
                ))}
              </Grid>
            ) : isLoggedUserProfile ? (
              <Empty
                className="DelegationsCards__EmptyContainer"
                icon={<Scale />}
                title={t('delegation.delegation_empty_title') || ''}
                description={t('delegation.delegation_address_empty') || ''}
                linkText={t('delegation.choose_delegate')}
                onLinkClick={() => setOpenDelegationModal(true)}
                actionType={ActionType.BUTTON}
              />
            ) : (
              <Empty
                className="DelegationsCards__EmptyContainer"
                icon={<Scale />}
                title={t('delegation.delegation_empty_title') || ''}
                description={t('delegation.delegation_address_empty') || ''}
              />
            )}
          </>
        )}
      </ActionBox>
      {!isLoadingVpDistribution && vpDistribution && (
        <VotingPowerDelegationModal
          vpDistribution={vpDistribution}
          openDelegationModal={openDelegationModal}
          setOpenDelegationModal={setOpenDelegationModal}
          selectedCandidate={selectedCandidate}
          setSelectedCandidate={setSelectedCandidate}
          showPickOtherDelegateButton
        />
      )}
    </div>
  )
}

export default VpDelegationBox
