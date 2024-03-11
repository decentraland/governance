import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { REASON_THRESHOLD } from '../../../constants'
import { isSameAddress } from '../../../entities/Snapshot/utils'
import { VoteByAddress } from '../../../entities/Votes/types'
import useDclProfiles from '../../../hooks/useDclProfiles'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { formatChoice } from '../../../utils/votes/utils'
import Comment from '../../Comments/Comment'
import Section from '../View/Section'

interface Props {
  votes?: VoteByAddress
  isLoadingVotes?: boolean
  choices: string[]
}

function VotingRationaleSection({ votes, isLoadingVotes, choices }: Props) {
  const t = useFormatMessage()
  const { formatNumber } = useIntl()
  const votesWithRationale = useMemo(
    () =>
      votes
        ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Object.fromEntries(Object.entries(votes).filter(([_, vote]) => !!vote.reason && vote.vp >= REASON_THRESHOLD))
        : undefined,
    [votes]
  )
  const showSection = votesWithRationale && Object.keys(votesWithRationale).length > 0
  const { profiles, isLoadingProfiles } = useDclProfiles(Object.keys(votesWithRationale || {}))
  return (
    <>
      {showSection && !isLoadingProfiles && (
        <Section isLoading={isLoadingVotes} title={t('page.rationale.title')} isNew>
          {Object.entries(votesWithRationale).map(([address, vote]) => {
            const profile = profiles.find((profile) => isSameAddress(profile.address, address))!
            return (
              <Comment
                key={address}
                cooked={vote.reason}
                forumUsername={profile.username || address}
                createdAt={new Date(vote.timestamp * 1000).toISOString()}
                avatarUrl={profile.avatarUrl}
                address={address}
                extraInfo={t('page.rationale.vote_info', {
                  choice: formatChoice(choices[vote.choice - 1]),
                  vp: formatNumber(vote.vp),
                })}
              />
            )
          })}
        </Section>
      )}
    </>
  )
}

export default VotingRationaleSection
