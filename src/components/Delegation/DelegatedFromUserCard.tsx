import React from 'react'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import ActionableLayout from '../Layout/ActionableLayout'
import Scale from '../Icon/Scale'
import { snapshotUrl } from '../../entities/Proposal/utils'
import useDelegation, { DelegationResult } from '../../hooks/useDelegation'
import useDelegatedVotingPower from '../../hooks/useDelegatedVotingPower'
import DelegatedCardProfile from './DelegatedCardProfile'
import Empty from '../Common/Empty'
import './DelegatedFromUserCard.css'

interface DelegatedFromUserCardProps {
  isLoggedUserProfile: boolean
  delegation: DelegationResult
  onEdit: () => void
}

const DelegatedFromUserCard = ({ isLoggedUserProfile, delegation, onEdit }: DelegatedFromUserCardProps) => {
  const t = useFormatMessage()

  const address = delegation?.delegatedTo?.length > 0 ? delegation?.delegatedTo[0].delegate : null
  const [delegateDelegations] = useDelegation(address)
  const { delegatedVotingPower } = useDelegatedVotingPower(delegateDelegations.delegatedFrom)

  return (
    <ActionableLayout
      className="DelegatedFromUserCard"
      rightAction={
        isLoggedUserProfile && (
          <Button basic onClick={onEdit}>
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
              onLinkClick={() => alert('TODO: Opens voting power delegation modal')}
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
    </ActionableLayout>
  )
}

export default DelegatedFromUserCard
