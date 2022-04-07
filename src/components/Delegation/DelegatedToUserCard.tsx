import ActionableLayout from '../Layout/ActionableLayout'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import VotingPower from '../Token/VotingPower'
import React, { useMemo, useState } from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Stats } from 'decentraland-ui/dist/components/Stats/Stats'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { snapshotUrl } from '../../entities/Proposal/utils'
import useDelegation from '../../hooks/useDelegation'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { Snapshot } from '../../api/Snapshot'
import './DelegatedToUserCard.css'
import VotingPowerListItem from './VotingPowerListItem'
import { VotingPowerList } from './VotingPowerList'

const SNAPSHOT_SPACE = process.env.GATSBY_SNAPSHOT_SPACE || ''
const EDIT_DELEGATION = snapshotUrl(`#/delegate/${SNAPSHOT_SPACE}`)
const DISPLAYED_DELEGATIONS = 5

interface DelegatedToUserCardProps {
  address: string | null
}

export default function DelegatedToUserCard({ address }: DelegatedToUserCardProps) {
  const t = useFormatMessage()
  const [showDelegatorsList, setShowDelegatorsList] = useState(false)
  const [delegation, delegationState] = useDelegation(address, SNAPSHOT_SPACE)
  const [space] = useAsyncMemo(() => Snapshot.get().getSpace(SNAPSHOT_SPACE), [SNAPSHOT_SPACE])
  const delegators = delegation.delegatedFrom
  const [scores, scoresState] = useAsyncMemo(
    () =>
      Snapshot.get().getLatestScores(
        space!,
        delegators.map((delegation) => delegation.delegator)
      ),
    [space, delegators],
    { callWithTruthyDeps: true }
  )
  const delegatedVotingPower = useMemo(
    () => Object.values(scores || {}).reduce((total, current) => total + current, 0),
    [scores]
  )

  return (
    <>
      <ActionableLayout
        className={'DelegatedToUser'}
        leftAction={<Header sub>{t(`page.balance.delegated_to_user_label`)}</Header>}
        rightAction={
          <Button basic as={Link} href={EDIT_DELEGATION}>
            {t(`page.balance.delegated_to_user_action`)}
          </Button>
        }
      >
        <Card>
          <Card.Content>
            <div className={'DelegatedToUser__Title'}>
              <Header className={'DelegatedToUser__Title__Header'}>{t(`page.balance.delegated_to_user_title`)}</Header>
              {!delegationState.loading && <VotingPower value={delegatedVotingPower} size="medium" />}
              <Loader size="tiny" className="balance" active={delegationState.loading || scoresState.loading} />
            </div>

            <Stats className={'DelegatedToUser__Subtitle'} title={delegators.length + ' individuals' || ''} />
            <div className="ProfileListContainer">
              {delegators.length > 0 &&
                delegators.slice(0, DISPLAYED_DELEGATIONS).map((delegation) => {
                  const key = [delegation.delegate, delegation.delegator].join('::')
                  return (
                    <VotingPowerListItem
                      key={key}
                      address={delegation.delegator}
                      votingPower={scores && scores[delegation.delegator.toLowerCase()]}
                    />
                  )
                })}
            </div>
            {delegators.length > DISPLAYED_DELEGATIONS && (
              <Button
                className={'DelegatedToUser__ViewMore'}
                onClick={() => {
                  setShowDelegatorsList(true)
                }}
              >
                {'View All'}
              </Button>
            )}
          </Card.Content>
        </Card>
      </ActionableLayout>
      <VotingPowerList
        open={showDelegatorsList}
        delegators={delegators}
        scores={scores}
        onClose={() => setShowDelegatorsList(false)}
      />
    </>
  )
}
