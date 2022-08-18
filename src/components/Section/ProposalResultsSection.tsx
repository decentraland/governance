import React, { useMemo } from 'react'

import Anchor from 'decentraland-gatsby/dist/components/Text/Link'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { isEmpty } from 'lodash'

import { ProposalAttributes, ProposalStatus } from '../../entities/Proposal/types'
import { Vote } from '../../entities/Votes/types'
import { calculateResult } from '../../entities/Votes/utils'
import Lock from '../Icon/Lock'
import ChoiceProgress from '../Status/ChoiceProgress'

import './DetailsSection.css'
import { ProposalPromotionSection } from './ProposalPromotionSection'
import './ProposalResultsSection.css'
import VotingStatusSummary from './VotingStatusSummary'

export type ProposalGovernanceSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null
  userHasVoted?: boolean
  votes?: Record<string, Vote> | null
  loading?: boolean
  onOpenVotesList?: () => void
}

const EMPTY_CHOICES: string[] = []

export default function ProposalResultsSection({
  proposal,
  loading,
  votes,
  onOpenVotesList,
}: ProposalGovernanceSectionProps) {
  const t = useFormatMessage()
  const [account] = useAuthContext()
  const choices: string[] = proposal?.snapshot_proposal?.choices || EMPTY_CHOICES
  const results = useMemo(() => calculateResult(choices, votes || {}), [choices, votes])
  const userHasVoted = !!account && !isEmpty(votes?.[account])
  const showVotingStatusSummary =
    proposal && !!proposal.required_to_pass && !(proposal.status === ProposalStatus.Passed)
  const showSeeVotesButton = useMemo(() => Object.keys(votes || {}).length > 0, [votes])

  //TODO: DetailsSection should be called ProposalSidebar section or smth
  return (
    <div className="DetailsSection__Content">
      <Loader active={loading} />
      <div className="DetailsSection__Flex_Header_Labels">
        <Header sub className="ProposalResultsSection__Header">
          {t('page.proposal_detail.result_label')}
          <Lock />
        </Header>
        {showSeeVotesButton && <Anchor onClick={onOpenVotesList}>{t('page.proposal_detail.see_votes_button')}</Anchor>}
      </div>
      {userHasVoted &&
        results.map((result) => {
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
      {!userHasVoted && (
        <Markdown className="ProposalResultsSection__CallToAction">
          **Cast your vote** to view partial voting results for this proposal.
        </Markdown>
      )}
      <ProposalPromotionSection proposal={proposal} loading={loading} />
      {showVotingStatusSummary && <VotingStatusSummary proposal={proposal} votes={results} />}
    </div>
  )
}
