import React, { useEffect, useState } from 'react'

import { ChainId } from '@dcl/schemas'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useEnsBalance from 'decentraland-gatsby/dist/hooks/useEnsBalance'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useLandBalance from 'decentraland-gatsby/dist/hooks/useLandBalance'
import useManaBalance from 'decentraland-gatsby/dist/hooks/useManaBalance'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { Stats } from 'decentraland-ui/dist/components/Stats/Stats'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { Snapshot } from '../../../api/Snapshot'
import { SNAPSHOT_SPACE } from '../../../entities/Snapshot/constants'
import { useBalanceOf, useWManaContract } from '../../../hooks/useContract'
import useDelegatedVotingPower from '../../../hooks/useDelegatedVotingPower'
import useDelegation from '../../../hooks/useDelegation'
import useProfile from '../../../hooks/useProfile'
import useVotingPowerBalance from '../../../hooks/useVotingPowerBalance'
import ChevronLeft from '../../Icon/ChevronLeft'
import { LAND_MULTIPLIER } from '../../Token/LandBalanceCard'
import { NAME_MULTIPLIER } from '../../Token/NameBalanceCard'
import VotingPower from '../../Token/VotingPower'
import { Candidate } from '../VotingPowerDelegationModal/VotingPowerDelegationModal'

import CandidateDetails from './CandidateDetails'
import './VotingPowerDelegationDetail.css'
import VotingPowerDistribution from './VotingPowerDistribution'

type VotingPowerDelegationDetailProps = {
  candidate: Candidate
  onBackClick: () => void
}

function VotingPowerDelegationDetail({ candidate, onBackClick }: VotingPowerDelegationDetailProps) {
  const t = useFormatMessage()
  const { address } = candidate
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
  const { profile } = useProfile(address)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFadeout, setShowFadeout] = useState('')

  useEffect(() => {
    if (!isExpanded) {
      setTimeout(() => {
        setShowFadeout('')
      }, 500)
    } else {
      setShowFadeout('Fadeout--hidden')
    }
  }, [isExpanded])

  const mana = mainnetMana + maticMana + (wMana || 0)
  const totalVotingPower = votingPower - delegatedVotingPower

  return (
    <>
      <Modal.Header className="VotingPowerDelegationDetail__Header">
        <Button basic aria-label={t('modal.vp_delegation.backButtonLabel')} onClick={onBackClick}>
          <ChevronLeft />
        </Button>
        <Avatar size="small" address={candidate.address} />
        {profile?.name || <Address value={candidate.address} />}
      </Modal.Header>
      <Modal.Content className="VotingPowerDelegationDetail__Content">
        <div className={TokenList.join(['Info', isExpanded && 'Info--expanded'])}>
          <Grid columns="equal">
            <Grid.Column width={10}>
              <CandidateDetails title={t('modal.vp_delegation.details.about_title')} content={candidate.bio} />
              <CandidateDetails
                title={t('modal.vp_delegation.details.involvement_title')}
                content={candidate.involvement}
              />
              <CandidateDetails
                title={t('modal.vp_delegation.details.motivation_title')}
                content={candidate.motivation}
              />
              <CandidateDetails title={t('modal.vp_delegation.details.vision_title')} content={candidate.vision} />
              <CandidateDetails
                title={t('modal.vp_delegation.details.most_important_issue_title')}
                content={candidate.most_important_issue}
              />
            </Grid.Column>
            <Grid.Column>
              <CandidateDetails title={t('modal.vp_delegation.details.links_title')} links={candidate.links} />
              <CandidateDetails
                title={t('modal.vp_delegation.details.relevant_skills_title')}
                skills={candidate.relevant_skills}
              />
            </Grid.Column>
          </Grid>
          <div className={TokenList.join(['Fadeout', showFadeout])} />
        </div>
        <div className="ShowMore">
          <div className="Divider" />
          <Button secondary onClick={() => setIsExpanded((prev) => !prev)}>
            {t(`modal.vp_delegation.details.${!isExpanded ? 'show_more' : 'show_less'}`)}
          </Button>
        </div>
        <Grid columns={3}>
          <Grid.Row>
            <Grid.Column>
              <Stats title={t('modal.vp_delegation.details.stats_own_voting_power')}>
                <VotingPower value={votingPower} size="large" />
              </Stats>
            </Grid.Column>
            <Grid.Column>
              <Stats title={t('modal.vp_delegation.details.stats_delegated_voting_power')}>
                <VotingPower value={delegatedVotingPower} size="large" />
              </Stats>
            </Grid.Column>
            <Grid.Column>
              <Stats title={t('modal.vp_delegation.details.stats_total_voting_power')}>
                <VotingPower value={totalVotingPower} size="large" />
              </Stats>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Stats title={t('modal.vp_delegation.details.stats_mana')}>
                <VotingPower value={Math.floor(mana)} size="medium" />
              </Stats>
            </Grid.Column>
            <Grid.Column>
              <Stats title={t('modal.vp_delegation.details.stats_land')}>
                <VotingPower value={land! * LAND_MULTIPLIER} size="medium" />
              </Stats>
            </Grid.Column>
            <Grid.Column>
              <Stats title={t('modal.vp_delegation.details.stats_name')}>
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
                <Stats title={t('modal.vp_delegation.details.stats_active_since')}>
                  <div className="VotingPowerDelegationDetail__StatsValue">
                    {Time.unix(votes[0].created).format('MMMM, YYYY')}
                  </div>
                </Stats>
              </Grid.Column>
            )}
            {votes && (
              <Grid.Column>
                <Stats title={t('modal.vp_delegation.details.stats_voted_on')}>
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
