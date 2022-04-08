import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Stats } from 'decentraland-ui/dist/components/Stats/Stats'
import React, { useMemo, useState } from 'react'
import { DelegationResult } from '../../hooks/useDelegation'
import Empty from '../Common/Empty'
import Scale from '../Icon/Scale'
import ActionableLayout from '../Layout/ActionableLayout'
import VotingPower from '../Token/VotingPower'
import { VotingPowerList } from './VotingPowerList'
import VotingPowerListItem from './VotingPowerListItem'
import './DelegatedToUserCard.css'

const DISPLAYED_DELEGATIONS = 5
const OPEN_CALL_FOR_DELEGATES_LINK = 'https://forum.decentraland.org/t/open-call-for-delegates-apply-now/5840/5'

interface Props {
  delegation: DelegationResult
  scores: Record<string, number> | null
  isLoggedUserProfile: boolean
  loading: boolean
}

export default function DelegatedToUserCard({ isLoggedUserProfile, delegation, scores, loading }: Props) {
  const t = useFormatMessage()
  const [showDelegatorsList, setShowDelegatorsList] = useState(false)
  const delegators = delegation.delegatedFrom
  const delegatedVotingPower = useMemo(
    () => Object.values(scores || {}).reduce((total, current) => total + current, 0),
    [scores]
  )
  const delegationsList = useMemo(
    () =>
      delegators && delegators.length > 0 && scores
        ? delegators
            .map((delegation) => {
              return { delegator: delegation.delegator, vp: scores[delegation.delegator.toLowerCase()] || 0 }
            })
            .sort((d1, d2) => (d1.vp > d2.vp ? -1 : d1.vp < d2.vp ? 1 : 0))
        : [],
    [delegators, scores]
  )

  return (
    <>
      <ActionableLayout
        className={'DelegatedToUser'}
        leftAction={<Header sub>{t(`page.balance.delegation_cards_label`)}</Header>}
      >
        <Card>
          <Card.Content className="DelegatedCard">
            {delegators.length === 0 && (
              <Empty
                icon={<Scale />}
                title={
                  t(
                    isLoggedUserProfile
                      ? `page.balance.delegated_to_user_empty_title`
                      : `page.balance.delegated_to_address_empty_title`
                  ) || ''
                }
                description={t(`page.balance.delegated_to_user_empty_description`) || ''}
                linkText={t('page.balance.delegated_to_user_empty_link')}
                linkHref={OPEN_CALL_FOR_DELEGATES_LINK}
              />
            )}
            {delegators.length > 0 && (
              <>
                <div className={'DelegatedToUser__Title'}>
                  <Header className={'DelegatedToUser__Title__Header'}>
                    {t(
                      isLoggedUserProfile
                        ? `page.balance.delegated_to_user_title`
                        : `page.balance.delegated_to_address_title`
                    ) || ''}
                  </Header>
                  {!loading && <VotingPower value={delegatedVotingPower} size="small" bold={true} />}
                  <Loader size="tiny" className="balance" active={loading} />
                </div>

                <Stats className={'DelegatedToUser__Subtitle'} title={delegators.length + ' individuals' || ''} />
                <div className="ProfileListContainer">
                  {delegationsList &&
                    delegationsList.slice(0, DISPLAYED_DELEGATIONS).map((delegation) => {
                      return (
                        <VotingPowerListItem
                          key={delegation.delegator}
                          address={delegation.delegator}
                          votingPower={delegation.vp}
                        />
                      )
                    })}
                </div>
                {delegationsList && delegationsList.length > DISPLAYED_DELEGATIONS && (
                  <Button
                    className={'DelegatedToUser__ViewAll'}
                    onClick={() => {
                      setShowDelegatorsList(true)
                    }}
                  >
                    {t(`page.balance.delegated_to_view_all_button`)}
                  </Button>
                )}
              </>
            )}
          </Card.Content>
        </Card>
      </ActionableLayout>
      <VotingPowerList
        open={showDelegatorsList}
        delegations={delegationsList}
        onClose={() => setShowDelegatorsList(false)}
      />
    </>
  )
}
