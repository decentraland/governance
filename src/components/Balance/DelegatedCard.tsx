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
import Empty from '../Proposal/Empty'
import './DelegatedCard.css'

const SNAPSHOT_SPACE = process.env.GATSBY_SNAPSHOT_SPACE || '' // TODO: Move to snapshot utils file
const EDIT_DELEGATION_URL = snapshotUrl(`#/delegate/${SNAPSHOT_SPACE}`) // TODO: Move to snapshot utils file

interface Props {
  delegation: DelegationResult
  account: string | null
  accountBalance: string | null
}

const DelegatedCard = ({ delegation, account, accountBalance }: Props) => {
  const l = useFormatMessage()

  return (
    <ActionableLayout
      rightAction={
        <Button basic as={Link} href={EDIT_DELEGATION_URL} className="screenOnly">
          {l(`page.balance.delegations_from_action`)}
          <Icon name="chevron right" />
        </Button>
      }
    >
      <Card>
        <Card.Content className="DelegatedCard">
          {delegation.delegatedTo.length === 0 && (
            <Empty
              icon={<Scale />}
              title={l('page.balance.delegations_from_empty_title')}
              description={
                l(
                  account === accountBalance
                    ? `page.balance.delegations_from_you_empty_description`
                    : `page.balance.delegations_from_address_empty`
                ) || ''
              }
              linkText={l('page.balance.delegations_from_delegate_vp')}
              onLinkClick={() => alert('TODO: Opens voting power delegation modal')}
            />
          )}
          {delegation.delegatedTo.length > 0 && (
            <>
              <Header>{l(`page.balance.delegations_from_title`)}</Header>
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

export default DelegatedCard
