import React, { useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { DelegationResult } from '../../clients/SnapshotGraphql'
import useDelegation from '../../hooks/useDelegation'
import Empty from '../Common/Empty'
import Scale from '../Icon/Scale'
import ActionableLayout from '../Layout/ActionableLayout'
import VotingPowerDelegationDetail from '../Modal/VotingPowerDelegationDetail/VotingPowerDelegationDetail'
import VotingPowerDelegationModal, { Candidate } from '../Modal/VotingPowerDelegationModal/VotingPowerDelegationModal'

import DelegatedCardProfile from './DelegatedCardProfile'
import './DelegatedFromUserCard.css'

interface DelegatedFromUserCardProps {
  isLoggedUserProfile: boolean
  delegation: DelegationResult
  ownVp: number
}

const DelegatedFromUserCard = ({ isLoggedUserProfile, delegation, ownVp }: DelegatedFromUserCardProps) => {
  const t = useFormatMessage()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const delegationModalInitiallyOpen = params.get('openDelegatesModal') === 'true'
  const address = delegation?.delegatedTo?.length > 0 ? delegation?.delegatedTo[0].delegate : null
  const [delegateDelegations] = useDelegation(address)
  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(delegationModalInitiallyOpen)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const handleSelectedCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsDelegationModalOpen(false)
  }

  const handleClose = () => {
    setSelectedCandidate(null)
    setIsDelegationModalOpen(false)
  }

  const handleBackClick = () => {
    setSelectedCandidate(null)
    setIsDelegationModalOpen(true)
  }

  return (
    <ActionableLayout
      className="DelegatedFromUserCard"
      rightAction={
        isLoggedUserProfile &&
        delegateDelegations.delegatedFrom.length > 0 && (
          <Button basic onClick={() => setIsDelegationModalOpen(true)}>
            {t(`page.balance.delegations_from_action`)}
          </Button>
        )
      }
    >
      <Card>
        <Card.Content className="DelegatedFromUserCard__Content">
          {delegation.delegatedTo.length === 0 && (
            <Empty
              icon={<Scale />}
              title={t('page.balance.delegations_from_empty_title')}
              description={
                t(
                  isLoggedUserProfile
                    ? 'page.balance.delegations_from_you_empty_description'
                    : 'page.balance.delegations_from_address_empty'
                ) || ''
              }
              linkText={isLoggedUserProfile ? t('page.balance.delegations_from_delegate_vp') : ''}
              onLinkClick={() => setIsDelegationModalOpen(true)}
            />
          )}
          {delegation.delegatedTo.length > 0 && (
            <>
              <Header>
                {t(
                  isLoggedUserProfile
                    ? 'page.balance.delegations_from_user_title'
                    : 'page.balance.delegations_from_address_title'
                )}
              </Header>
              {delegation.delegatedTo.map((delegation) => {
                return (
                  <DelegatedCardProfile
                    key={[delegation.delegate, delegation.delegator].join('::')}
                    address={delegation.delegate}
                    pickedBy={delegateDelegations?.delegatedFrom.length - 1}
                    votingPower={ownVp}
                  />
                )
              })}
            </>
          )}
        </Card.Content>
      </Card>
      <VotingPowerDelegationModal
        open={isDelegationModalOpen}
        setSelectedCandidate={handleSelectedCandidate}
        onClose={handleClose}
        showPickOtherDelegateButton
      />
      {selectedCandidate && (
        <Modal
          onClose={handleClose}
          size="small"
          closeIcon={<Close />}
          open={!!selectedCandidate}
          className="GovernanceContentModal VotingPowerDelegationModal"
        >
          <VotingPowerDelegationDetail userVP={ownVp} candidate={selectedCandidate} onBackClick={handleBackClick} />
        </Modal>
      )}
    </ActionableLayout>
  )
}

export default DelegatedFromUserCard
