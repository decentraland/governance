import './DelegatedFromUserCard.css'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import React, { useState } from 'react'
import Link from 'decentraland-gatsby/dist/components/Text/Link'

import useDelegatedVotingPower from '../../hooks/useDelegatedVotingPower'
import useDelegation, { DelegationResult } from '../../hooks/useDelegation'
import useVotingPowerBalance from '../../hooks/useVotingPowerBalance'
import Empty from '../Common/Empty'
import Scale from '../Icon/Scale'
import ActionableLayout from '../Layout/ActionableLayout'
import VotingPowerDelegationModal from '../Modal/VotingPowerDelegationModal/VotingPowerDelegationModal'
import DelegatedCardProfile from './DelegatedCardProfile'
import { snapshotUrl } from '../../entities/Proposal/utils'

interface DelegatedFromUserCardProps {
  isLoggedUserProfile: boolean
  delegation: DelegationResult
  space: string
}

const DelegatedFromUserCard = ({ isLoggedUserProfile, delegation, space }: DelegatedFromUserCardProps) => {
  const t = useFormatMessage()

  const address = delegation?.delegatedTo?.length > 0 ? delegation?.delegatedTo[0].delegate : null
  const [delegateDelegations] = useDelegation(address)
  const { delegatedVotingPower } = useDelegatedVotingPower(delegateDelegations.delegatedFrom)

  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false)
  const [userAddress] = useAuthContext()
  const [votingPower] = useVotingPowerBalance(userAddress, space)

  return (
    <ActionableLayout
      className="DelegatedFromUserCard"
      rightAction={
        isLoggedUserProfile && (
          <Button as={Link} basic href={snapshotUrl(`#/delegate/${space}`)}>
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
                    votingPower={delegatedVotingPower}
                  />
                )
              })}
            </>
          )}
        </Card.Content>
      </Card>
      <VotingPowerDelegationModal
        open={isDelegationModalOpen}
        onClose={() => setIsDelegationModalOpen(false)}
        vp={votingPower}
        space={space}
      />
    </ActionableLayout>
  )
}

export default DelegatedFromUserCard
