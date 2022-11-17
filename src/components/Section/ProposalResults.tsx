import React, { useEffect, useMemo, useRef } from 'react'

import Anchor from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { Vote } from '../../entities/Votes/types'
import Divider from '../Common/Divider'
import ChoiceProgress, { ChoiceProgressProps } from '../Status/ChoiceProgress'

import './DetailsSection.css'
import './ProposalResults.css'
import VotingResultsInfo from './VotingResultsInfo'

export type ProposalGovernanceSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal: ProposalAttributes
  userHasVoted?: boolean
  votes?: Record<string, Vote> | null
  partialResults: ChoiceProgressProps[]
  loading?: boolean
  onOpenVotesList?: () => void
  elementRef: React.RefObject<HTMLDivElement>
}

export default function ProposalResults({
  proposal,
  loading,
  votes,
  partialResults,
  onOpenVotesList,
  elementRef,
}: ProposalGovernanceSectionProps) {
  const t = useFormatMessage()
  const showSeeVotesButton = useMemo(() => Object.keys(votes || {}).length > 0, [votes])

  return (
    <div className="ProposalResults" ref={elementRef}>
      <Divider />
      <Loader active={loading} />
      <div className="ProposalResults__Header">
        <Header>Proposal Results</Header>
        {showSeeVotesButton && <Anchor onClick={onOpenVotesList}>{t('page.proposal_detail.see_votes_button')}</Anchor>}
      </div>
      <div className="ProposalResults__Content">
        <div className="ProposalResults__ChoicesProgress">
          {partialResults.map((result) => {
            return (
              <ChoiceProgress
                key={result.choice}
                color={result.color}
                choice={result.choice}
                votes={result.votes}
                power={result.power}
                progress={result.progress}
              />
            )
          })}
        </div>
        <VotingResultsInfo partialResults={partialResults} proposal={proposal} />
      </div>
    </div>
  )
}
