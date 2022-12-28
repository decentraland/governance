import React, { useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { DelegationResult } from '../../clients/SnapshotGraphqlTypes'
import { isSameAddress } from '../../entities/Snapshot/utils'
import useVotingPowerDistribution from '../../hooks/useVotingPowerDistribution'
import Empty from '../Common/Empty'
import SkeletonBars from '../Common/SkeletonBars'
import DelegatorCardProfile from '../Delegation/DelegatorCardProfile'
import Scale from '../Icon/Scale'
import VotingPowerDelegationDetail from '../Modal/VotingPowerDelegationDetail/VotingPowerDelegationDetail'
import VotingPowerDelegationModal, { Candidate } from '../Modal/VotingPowerDelegationModal/VotingPowerDelegationModal'

import { ProfileBox } from './ProfileBox'

interface Props {
  address: string | null
  delegation: DelegationResult
  isLoadingDelegations: boolean
  ownVp: number | undefined
  isLoadingOwnVp: boolean
}

function VpDelegationBox({ address, delegation, isLoadingDelegations, ownVp, isLoadingOwnVp }: Props) {
  const t = useFormatMessage()
  const [userAddress] = useAuthContext()
  const isLoggedUserProfile = isSameAddress(userAddress, address)
  const isLoading = isLoadingDelegations || isLoadingOwnVp
  const { delegatedTo } = delegation
  const [isFullListOpened, setIsFullListOpened] = useState(false)
  const [isFullList, setIsFullList] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(address)

  const toggleFullList = (state: boolean) => {
    setIsFullList(state)
    setIsFullListOpened(state)
  }

  const handleViewAllDelegatesClick = () => {
    toggleFullList(true)
  }

  const handleSelectedCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    if (isFullList) {
      setIsFullListOpened(false)
    }
  }

  const clearSelectedCandidate = () => {
    setSelectedCandidate(null)
    if (isFullList) {
      setIsFullListOpened(true)
    }
  }

  const handleModalClose = () => {
    setSelectedCandidate(null)
    toggleFullList(false)
  }

  const profileHasADelegation = delegatedTo.length > 0 && ownVp
  return (
    <Container>
      <ProfileBox
        title={t('page.profile.delegation.title')}
        info={t('page.profile.delegation.helper')}
        action={
          profileHasADelegation &&
          isLoggedUserProfile && (
            <Button basic onClick={handleViewAllDelegatesClick}>
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
                onLinkClick={handleViewAllDelegatesClick}
                asButton
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
      </ProfileBox>
      <VotingPowerDelegationModal
        onClose={handleModalClose}
        setSelectedCandidate={handleSelectedCandidate}
        open={isFullListOpened}
        showPickOtherDelegateButton
      />
      {selectedCandidate && !isLoadingVpDistribution && vpDistribution && (
        <Modal
          onClose={handleModalClose}
          size="small"
          closeIcon={<Close />}
          className="GovernanceContentModal VotingPowerDelegationModal"
          open={!!selectedCandidate}
        >
          <VotingPowerDelegationDetail
            userVP={vpDistribution.own}
            candidate={selectedCandidate}
            onBackClick={clearSelectedCandidate}
          />
        </Modal>
      )}
    </Container>
  )
}

export default VpDelegationBox
