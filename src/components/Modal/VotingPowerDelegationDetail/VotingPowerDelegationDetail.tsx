import React, { useCallback, useEffect, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { Stats } from 'decentraland-ui/dist/components/Stats/Stats'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { VotedProposal } from '../../../entities/Votes/types'
import useVotesMatch from '../../../hooks/useVotesMatch'
import useVotingPowerDistribution from '../../../hooks/useVotingPowerDistribution'
import ChevronLeft from '../../Icon/ChevronLeft'
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

  const [userAddress] = useAuthContext()
  const {
    otherAccountVotes: candidateVotes,
    matchResult,
    votesInformationLoading,
  } = useVotesMatch(userAddress, candidateAddress)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFadeout, setShowFadeout] = useState(true)
  const [filteredCandidateVotes, setFilteredCandidateVotes] = useState<VotedProposal[]>([])

  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(candidateAddress)
  const isLoading = isLoadingVpDistribution || votesInformationLoading

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

  return (
    <>
      <Modal.Header
        className={TokenList.join(['VotingPowerDelegationModal__Header', 'VotingPowerDelegationDetail__Header'])}
      >
        <div className="VotingPowerDelegationDetail__CandidateName">
          <Button basic aria-label={t('modal.vp_delegation.backButtonLabel')} onClick={onBackClick}>
            <ChevronLeft />
          </Button>
          <Username address={candidate.address} size="small" />
        </div>
        <VotingPowerDelegationHandler
          buttonText={t('modal.vp_delegation.delegate_button')}
          userVP={userVP}
          candidateAddress={candidateAddress}
        />
      </Modal.Header>
      <Modal.Content className="VotingPowerDelegationDetail__Content">
        <div className={TokenList.join(['Info', isExpanded && 'Info--expanded'])}>
          <div className="CandidateDetails__Container">
            <div>
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
            </div>
            <div>
              <CandidateDetails title={t('modal.vp_delegation.details.links_title')} links={candidate.links} />
              <CandidateDetails
                title={t('modal.vp_delegation.details.relevant_skills_title')}
                skills={candidate.relevant_skills}
              />
            </div>
          </div>
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
        {!isLoading && vpDistribution && (
          <>
            <div className="DelegationDetails__Stats">
              <div className="DelegationDetails__StatPlaceholder">
                <Stats title={t('modal.vp_delegation.details.stats_own_voting_power')}>
                  <VotingPower value={vpDistribution.own} size="large" />
                </Stats>
              </div>
              <div className="DelegationDetails__StatPlaceholder">
                <Stats title={t('modal.vp_delegation.details.stats_delegated_voting_power')}>
                  <VotingPower value={vpDistribution.delegated} size="large" />
                </Stats>
              </div>
              <div className="DelegationDetails__StatPlaceholder">
                <Stats title={t('modal.vp_delegation.details.stats_total_voting_power')}>
                  <VotingPower value={vpDistribution.total} size="large" />
                </Stats>
              </div>
              <div className="DelegationDetails__StatPlaceholder">
                <Stats title={t('modal.vp_delegation.details.stats_mana')}>
                  <VotingPower value={vpDistribution.mana} size="medium" />
                </Stats>
              </div>
              <div className="DelegationDetails__StatPlaceholder">
                <Stats title={t('modal.vp_delegation.details.stats_name')}>
                  <VotingPower value={vpDistribution.names} size="medium" />
                </Stats>
              </div>
              <div className="DelegationDetails__StatPlaceholder">
                <Stats title={t('modal.vp_delegation.details.stats_linked_wearables')}>
                  <VotingPower value={vpDistribution.linkedWearables} size="medium" />
                </Stats>
              </div>
              <div className="DelegationDetails__StatPlaceholder">
                <Stats title={t('modal.vp_delegation.details.stats_land')}>
                  <VotingPower value={vpDistribution.land} size="medium" />
                </Stats>
              </div>
              <div className="DelegationDetails__StatPlaceholder">
                <Stats title={t('modal.vp_delegation.details.stats_estate')}>
                  <VotingPower value={vpDistribution.estate} size="medium" />
                </Stats>
              </div>
              <div className="DelegationDetails__StatPlaceholderFullWidth">
                <VotingPowerDistribution
                  className="DelegationDetails__VotingPowerDistribution"
                  vpDistribution={vpDistribution}
                />
              </div>

              {candidateVotes && (
                <>
                  {candidateVotes.length > 0 && (
                    <div className="DelegationDetails__StatPlaceholder">
                      <Stats title={t('modal.vp_delegation.details.stats_active_since')}>
                        <div className="VotingPowerDelegationDetail__StatsValue">
                          {Time.unix(candidateVotes[candidateVotes.length - 1].created).format('MMMM, YYYY')}
                        </div>
                      </Stats>
                    </div>
                  )}
                  <div className="DelegationDetails__StatPlaceholder">
                    <Stats title={t('modal.vp_delegation.details.stats_voted_on')}>
                      <div className="VotingPowerDelegationDetail__StatsValue">{candidateVotes.length}</div>
                    </Stats>
                  </div>
                  {matchResult.percentage > 0 && (
                    <div className="DelegationDetails__StatPlaceholder">
                      <CandidateMatch matchingVotes={matchResult} />
                    </div>
                  )}
                </>
              )}
            </div>
            {filteredCandidateVotes.length > 0 && (
              <VotedInitiativeList candidateVotes={filteredCandidateVotes} matches={matchResult.matches} />
            )}
          </>
        )}
      </Modal.Content>
      {!isLoading && !hasShownAllVotes && (
        <Button fluid onClick={handleReadMoreClick} primary>
          {t('modal.vp_delegation.details.stats_view_more')}
        </Button>
      )}
    </>
  )
}

export default VotingPowerDelegationDetail
