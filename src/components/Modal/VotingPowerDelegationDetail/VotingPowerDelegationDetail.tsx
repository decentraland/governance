import React, { useCallback, useEffect, useState } from 'react'

import { ChainId } from '@dcl/schemas'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useEnsBalance from 'decentraland-gatsby/dist/hooks/useEnsBalance'
import useEstateBalance from 'decentraland-gatsby/dist/hooks/useEstateBalance'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useLandBalance from 'decentraland-gatsby/dist/hooks/useLandBalance'
import useManaBalance from 'decentraland-gatsby/dist/hooks/useManaBalance'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { Stats } from 'decentraland-ui/dist/components/Stats/Stats'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { VotedProposal } from '../../../entities/Votes/types'
import { useBalanceOf, useManaContract, useWManaContract } from '../../../hooks/useContract'
import useVotesMatch from '../../../hooks/useVotesMatch'
import useVotingPowerInformation from '../../../hooks/useVotingPowerInformation'
import ChevronLeft from '../../Icon/ChevronLeft'
import { LAND_MULTIPLIER } from '../../Token/LandBalanceCard'
import { NAME_MULTIPLIER } from '../../Token/NameBalanceCard'
import VotingPower from '../../Token/VotingPower'
import Username from '../../User/Username'
import { Candidate } from '../VotingPowerDelegationModal/VotingPowerDelegationModal'

import CandidateDetails from './CandidateDetails'
import CandidateMatch from './CandidateMatch'
import VotedInitiativeList from './VotedInitiativeList'
import './VotingPowerDelegationDetail.css'
import VotingPowerDelegationHandler from './VotingPowerDelegationHandler'
import VotingPowerDistribution from './VotingPowerDistribution'

type VotingPowerDelegationDetailProps = {
  candidate: Candidate
  userVP: number
  onBackClick: () => void
}

let timeout: ReturnType<typeof setTimeout>
const VOTES_PER_PAGE = 10

function VotingPowerDelegationDetail({ candidate, userVP, onBackClick }: VotingPowerDelegationDetailProps) {
  const t = useFormatMessage()
  const { address: candidateAddress } = candidate
  const { votingPower, isLoadingVotingPower, delegatedVotingPower, isLoadingScores, ownVotingPower } =
    useVotingPowerInformation(candidateAddress)

  const [maticMana, maticManaState] = useManaBalance(candidateAddress, ChainId.MATIC_MAINNET)

  const manaContract = useManaContract()
  const [mainnetMana, mainnetManaState] = useBalanceOf(manaContract, candidateAddress, 'ether')

  const wManaContract = useWManaContract()
  const [wMana, wManaState] = useBalanceOf(wManaContract, candidateAddress, 'ether')
  const [land, landState] = useLandBalance(candidateAddress, ChainId.ETHEREUM_MAINNET)
  const [ens, ensState] = useEnsBalance(candidateAddress, ChainId.ETHEREUM_MAINNET)
  const [, estateLand, estateState] = useEstateBalance(candidateAddress, ChainId.ETHEREUM_MAINNET)

  const [userAddress] = useAuthContext()
  const {
    otherAccountVotes: candidateVotes,
    matchResult,
    votesInformationLoading,
  } = useVotesMatch(userAddress, candidateAddress)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFadeout, setShowFadeout] = useState(true)
  const [filteredCandidateVotes, setFilteredCandidateVotes] = useState<VotedProposal[]>([])

  useEffect(() => {
    if (!isExpanded) {
      timeout = setTimeout(() => {
        setShowFadeout(true)
      }, 500)
    } else {
      setShowFadeout(false)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [isExpanded])

  useEffect(() => {
    if (candidateVotes) {
      setFilteredCandidateVotes(candidateVotes.slice(0, 10))
    }
  }, [candidateVotes])

  const handleReadMoreClick = useCallback(() => {
    if (candidateVotes) {
      const newVotes = candidateVotes.slice(0, filteredCandidateVotes.length + VOTES_PER_PAGE)
      setFilteredCandidateVotes(newVotes)
    }
  }, [candidateVotes, filteredCandidateVotes])

  const hasShownAllVotes = candidateVotes?.length === filteredCandidateVotes.length
  const mana = (mainnetMana || 0) + maticMana + (wMana || 0)

  const isLoading =
    isLoadingVotingPower ||
    isLoadingScores ||
    mainnetManaState.loading ||
    maticManaState.loading ||
    wManaState.loading ||
    landState.loading ||
    ensState.loading ||
    estateState.loading ||
    votesInformationLoading

  const landVotingPower = (land + estateLand) * LAND_MULTIPLIER
  const nameVotingPower = ens * NAME_MULTIPLIER

  return (
    <>
      <Modal.Header
        className={TokenList.join(['VotingPowerDelegationModal__Header', 'VotingPowerDelegationDetail__Header'])}
      >
        <div className="VotingPowerDelegationDetail__CandidateName">
          <Button basic aria-label={t('modal.vp_delegation.backButtonLabel')} onClick={onBackClick}>
            <ChevronLeft />
          </Button>
          <Username address={candidate.address} size="small" blockieScale={4} />
        </div>
        <VotingPowerDelegationHandler userVP={userVP} candidateAddress={candidateAddress} />
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
          <div className={TokenList.join(['Fadeout', !showFadeout && 'Fadeout--hidden'])} />
        </div>
        <div className="ShowMore">
          <div className="Divider" />
          <Button secondary onClick={() => setIsExpanded((prev) => !prev)}>
            {t(`modal.vp_delegation.details.${!isExpanded ? 'show_more' : 'show_less'}`)}
          </Button>
        </div>
        {isLoading && (
          <Grid columns={1}>
            <Grid.Row>
              <div className="VotingPowerDelegationDetail__Loading">
                <Loader size="big" />
                <span className="VotingPowerDelegationDetail__LoaderText">
                  {t('modal.vp_delegation.details.stats_loading')}
                </span>
              </div>
            </Grid.Row>
          </Grid>
        )}
        {!isLoading && (
          <>
            <Grid columns={3}>
              <Grid.Row>
                <Grid.Column>
                  <Stats title={t('modal.vp_delegation.details.stats_own_voting_power')}>
                    <VotingPower value={ownVotingPower} size="large" />
                  </Stats>
                </Grid.Column>
                <Grid.Column>
                  <Stats title={t('modal.vp_delegation.details.stats_delegated_voting_power')}>
                    <VotingPower value={delegatedVotingPower} size="large" />
                  </Stats>
                </Grid.Column>
                <Grid.Column>
                  <Stats title={t('modal.vp_delegation.details.stats_total_voting_power')}>
                    <VotingPower value={votingPower} size="large" />
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
                    <VotingPower value={landVotingPower} size="medium" />
                  </Stats>
                </Grid.Column>
                <Grid.Column>
                  <Stats title={t('modal.vp_delegation.details.stats_name')}>
                    <VotingPower value={nameVotingPower} size="medium" />
                  </Stats>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row columns="1">
                <Grid.Column>
                  <VotingPowerDistribution
                    mana={mana}
                    name={nameVotingPower}
                    land={landVotingPower}
                    delegated={delegatedVotingPower}
                  />
                </Grid.Column>
              </Grid.Row>
              {candidateVotes && (
                <Grid.Row>
                  {candidateVotes.length > 0 && (
                    <Grid.Column>
                      <Stats title={t('modal.vp_delegation.details.stats_active_since')}>
                        <div className="VotingPowerDelegationDetail__StatsValue">
                          {Time.unix(candidateVotes[candidateVotes.length - 1].created).format('MMMM, YYYY')}
                        </div>
                      </Stats>
                    </Grid.Column>
                  )}
                  <Grid.Column>
                    <Stats title={t('modal.vp_delegation.details.stats_voted_on')}>
                      <div className="VotingPowerDelegationDetail__StatsValue">{candidateVotes.length}</div>
                    </Stats>
                  </Grid.Column>
                  {matchResult.percentage > 0 && (
                    <Grid.Column>
                      <CandidateMatch matchingVotes={matchResult} />
                    </Grid.Column>
                  )}
                </Grid.Row>
              )}
            </Grid>
            {filteredCandidateVotes.length > 0 && (
              <VotedInitiativeList candidateVotes={filteredCandidateVotes} matches={matchResult.matches} />
            )}
          </>
        )}
      </Modal.Content>
      {!isLoading && !hasShownAllVotes && (
        <Modal.Actions>
          <Button onClick={handleReadMoreClick} primary>
            {t('modal.vp_delegation.details.stats_view_more')}
          </Button>
        </Modal.Actions>
      )}
    </>
  )
}

export default VotingPowerDelegationDetail
