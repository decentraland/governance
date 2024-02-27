import { useMemo } from 'react'

import isEmpty from 'lodash/isEmpty'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { VoteByAddress } from '../../../entities/Votes/types'
import { calculateResult } from '../../../entities/Votes/utils'
import { useAuthContext } from '../../../front/context/AuthProvider'
import useFormatMessage from '../../../hooks/useFormatMessage'
import CategoryPill from '../../Category/CategoryPill'
import ChevronRight from '../../Icon/ChevronRight'
import Text from '../Typography/Text'

import ProposalPreviewCardSection from './ProposalPreviewCardSection'
import './VoteModule.css'

interface Props {
  proposal: ProposalAttributes
  votes?: VoteByAddress
}

function VoteModule({ proposal, votes }: Props) {
  const t = useFormatMessage()
  const [account] = useAuthContext()
  const hasVote = !!account && !isEmpty(votes?.[account])
  const choices = useMemo((): string[] => proposal?.snapshot_proposal?.choices || [], [proposal])
  const vote = hasVote && !!votes?.[account].choice ? choices[votes?.[account].choice - 1] : undefined
  const results = useMemo(
    () => calculateResult(proposal?.snapshot_proposal?.choices || [], votes || {}),
    [proposal?.snapshot_proposal?.choices, votes]
  )
  const vpInFavor = results[0].power || 0
  const threshold = proposal?.required_to_pass || 0
  const neededForAcceptance = threshold - vpInFavor
  const isThresholdStillNotMet = neededForAcceptance >= 0
  const votingConsensusText = t(
    `page.home.open_proposals.${isThresholdStillNotMet ? 'threshold_not_met' : 'threshold_met'}`
  )
  const votingNeededText = t(`page.home.open_proposals.${isThresholdStillNotMet ? 'vp_needed' : 'vp'}`, {
    value: t('general.number', { value: isThresholdStillNotMet ? neededForAcceptance : vpInFavor }),
  })
  return (
    <ProposalPreviewCardSection className="VoteModule">
      <div className="VoteModule__PillContainer">
        <CategoryPill proposalType={proposal.type} />
      </div>
      <div className="VoteModule__VoteSection">
        <div className="VoteModule__VotingContainer">
          {hasVote ? (
            <>
              <Text weight="semi-bold" size="xs" className="VoteModule__VotingConsensus">
                {t('page.home.open_proposals.you_voted')}
              </Text>
              <Text weight="semi-bold" size="xs" className="VoteModule__VotingVpNeeded">
                {vote || '-'}
              </Text>
            </>
          ) : (
            <>
              <Text weight="semi-bold" size="xs" className="VoteModule__VotingConsensus">
                {votingConsensusText}
              </Text>
              <Text weight="semi-bold" size="xs" className="VoteModule__VotingVpNeeded">
                {votingNeededText}
              </Text>
            </>
          )}
        </div>
        <div className="VoteModule__VoteContainer">
          {!hasVote && <span className="VoteModule__VoteText">{t('page.home.open_proposals.vote')}</span>}
          <ChevronRight color="var(--black-400)" />
        </div>
      </div>
    </ProposalPreviewCardSection>
  )
}

export default VoteModule
