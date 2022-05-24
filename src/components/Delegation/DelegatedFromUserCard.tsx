import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { DelegationResult } from '../../api/Snapshot'
import useDelegation from '../../hooks/useDelegation'
import Empty from '../Common/Empty'
import Scale from '../Icon/Scale'
import ActionableLayout from '../Layout/ActionableLayout'
import VotingPowerDelegationModal from '../Modal/VotingPowerDelegationModal/VotingPowerDelegationModal'

import DelegatedCardProfile from './DelegatedCardProfile'
import './DelegatedFromUserCard.css'

interface DelegatedFromUserCardProps {
  isLoggedUserProfile: boolean
  delegation: DelegationResult
  ownVp: number
}

const DelegatedFromUserCard = ({ isLoggedUserProfile, delegation, ownVp }: DelegatedFromUserCardProps) => {
  const t = useFormatMessage()

  const address = delegation?.delegatedTo?.length > 0 ? delegation?.delegatedTo[0].delegate : null
  const [delegateDelegations] = useDelegation(address)
  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false)

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
        userVp={ownVp}
        open={isDelegationModalOpen}
        onClose={() => setIsDelegationModalOpen(false)}
      />
    </ActionableLayout>
  )
}

export default DelegatedFromUserCard
