import React from 'react'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import ActionableLayout from '../Layout/ActionableLayout'
import Scale from '../Icon/Scale'
import { snapshotUrl } from '../../entities/Proposal/utils'
import { DelegationResult } from '../../hooks/useDelegation'
import DelegatedCardProfile from './DelegatedCardProfile'
import Empty from '../Common/Empty'
import './DelegatedFromUserCard.css'

const SNAPSHOT_SPACE = process.env.GATSBY_SNAPSHOT_SPACE || '' // TODO: Move to snapshot utils file
const EDIT_DELEGATION_URL = snapshotUrl(`#/delegate/${SNAPSHOT_SPACE}`) // TODO: Move to snapshot utils file

interface DelegatedFromUserCardProps {
  isLoggedUserProfile: boolean
  delegation: DelegationResult
}

const DelegatedFromUserCard = ({ isLoggedUserProfile, delegation }: DelegatedFromUserCardProps) => {
  const t = useFormatMessage()

  return (
    <ActionableLayout className="DelegatedFromUserCard"
      rightAction={
        isLoggedUserProfile && <Button basic as={Link} href={EDIT_DELEGATION_URL} >
          {t(`page.balance.delegations_from_action`)}
          <Icon name="chevron right" />
        </Button>
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
              <Header>{
                t(
                  isLoggedUserProfile ?
                    'page.balance.delegations_from_user_title' :
                    'page.balance.delegations_from_address_title'
                )}</Header>
              {delegation.delegatedTo.map((delegation) => {
                return (
                  <DelegatedCardProfile
                    key={[delegation.delegate, delegation.delegator].join('::')}
                    address={delegation.delegate}
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
