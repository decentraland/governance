import { ChainId } from '@dcl/schemas'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useEnsBalance from 'decentraland-gatsby/dist/hooks/useEnsBalance'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useLandBalance from 'decentraland-gatsby/dist/hooks/useLandBalance'
import useManaBalance from 'decentraland-gatsby/dist/hooks/useManaBalance'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { Stats } from 'decentraland-ui/dist/components/Stats/Stats'
import React from 'react'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'
import { Snapshot } from '../../../api/Snapshot'
import { SNAPSHOT_SPACE } from '../../../entities/Snapshot/constants'
import { useBalanceOf, useWManaContract } from '../../../hooks/useContract'
import useDelegatedVotingPower from '../../../hooks/useDelegatedVotingPower'
import { Delegate } from '../../../hooks/useDelegatesInfo'
import useDelegation from '../../../hooks/useDelegation'
import useVotingPowerBalance from '../../../hooks/useVotingPowerBalance'
import ChevronLeft from '../../Icon/ChevronLeft'
import { LAND_MULTIPLIER } from '../../Token/LandBalanceCard'
import { NAME_MULTIPLIER } from '../../Token/NameBalanceCard'
import VotingPower from '../../Token/VotingPower'
import VotingPowerDistribution from './VotingPowerDistribution'
import './VotingPowerDelegationDetail.css'

type VotingPowerDelegationDetailProps = {
  delegate: Delegate
  onBackClick: () => void
}

function VotingPowerDelegationDetail({ delegate, onBackClick }: VotingPowerDelegationDetailProps) {
  const t = useFormatMessage()
  const { address } = delegate
  const { votingPower } = useVotingPowerBalance(address)
  const [delegation] = useDelegation(address)
  const { delegatedVotingPower } = useDelegatedVotingPower(delegation.delegatedFrom)
  const [mainnetMana] = useManaBalance(address, ChainId.ETHEREUM_MAINNET)
  const [maticMana] = useManaBalance(address, ChainId.MATIC_MAINNET)
  const wManaContract = useWManaContract()
  const [wMana] = useBalanceOf(wManaContract, address, 'ether')
  const [land] = useLandBalance(address, ChainId.ETHEREUM_MAINNET)
  const [ens] = useEnsBalance(address, ChainId.ETHEREUM_MAINNET)
  const [votes] = useAsyncMemo(async () => Snapshot.get().getAddressVotes(SNAPSHOT_SPACE, address), [])

  const mana = mainnetMana + maticMana + (wMana || 0)
  const totalVotingPower = votingPower - delegatedVotingPower

  return (
    <>
      <Modal.Header className="VotingPowerDelegationDetail__Header">
        <Button basic aria-label={t('modal.vp_delegation_detail.backButtonLabel')} onClick={onBackClick}>
          <ChevronLeft />
        </Button>
        <span>{address}</span>
      </Modal.Header>
      <Modal.Content className="VotingPowerDelegationDetail__Content">
        <Grid columns={3}>
          <Grid.Row>
            <Grid.Column>
              <Stats title={t('modal.vp_delegation_detail.stats_own_voting_power')}>
                <VotingPower value={votingPower} size="large" />
              </Stats>
            </Grid.Column>
            <Grid.Column>
              <Stats title={t('modal.vp_delegation_detail.stats_delegated_voting_power')}>
                <VotingPower value={delegatedVotingPower} size="large" />
              </Stats>
            </Grid.Column>
            <Grid.Column>
              <Stats title={t('modal.vp_delegation_detail.stats_total_voting_power')}>
                <VotingPower value={totalVotingPower} size="large" />
              </Stats>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Stats title={t('modal.vp_delegation_detail.stats_mana')}>
                <VotingPower value={Math.floor(mana)} size="medium" />
              </Stats>
            </Grid.Column>
            <Grid.Column>
              <Stats title={t('modal.vp_delegation_detail.stats_land')}>
                <VotingPower value={land! * LAND_MULTIPLIER} size="medium" />
              </Stats>
            </Grid.Column>
            <Grid.Column>
              <Stats title={t('modal.vp_delegation_detail.stats_name')}>
                <VotingPower value={ens * NAME_MULTIPLIER} size="medium" />
              </Stats>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns="1">
            <Grid.Column>
              <VotingPowerDistribution
                mana={mana}
                name={ens * NAME_MULTIPLIER}
                land={land * LAND_MULTIPLIER}
                delegated={delegatedVotingPower}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            {votes && votes.length > 0 && (
              <Grid.Column>
                <Stats title={t('modal.vp_delegation_detail.stats_active_since')}>
                  <div className="VotingPowerDelegationDetail__StatsValue">
                    {Time.unix(votes[0].created).format('MMMM, YYYY')}
                  </div>
                </Stats>
              </Grid.Column>
            )}
            {votes && (
              <Grid.Column>
                <Stats title={t('modal.vp_delegation_detail.stats_voted_on')}>
                  <div className="VotingPowerDelegationDetail__StatsValue">{votes.length}</div>
                </Stats>
              </Grid.Column>
            )}
          </Grid.Row>
        </Grid>
      </Modal.Content>
    </>
  )
}

export default VotingPowerDelegationDetail
