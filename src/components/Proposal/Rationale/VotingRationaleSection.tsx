import { useMemo } from 'react'

import { isSameAddress } from '../../../entities/Snapshot/utils'
import { VoteByAddress } from '../../../entities/Votes/types'
import useDclProfiles from '../../../hooks/useDclProfiles'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Comment from '../../Comments/Comment'
import Section from '../View/Section'

interface Props {
  votes?: VoteByAddress
  isLoadingVotes?: boolean
}

function VotingRationaleSection({ votes, isLoadingVotes }: Props) {
  const t = useFormatMessage()
  const votesWithRationale = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    () => (votes ? Object.fromEntries(Object.entries(votes).filter(([_, vote]) => !!vote.reason)) : undefined),
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
              />
            )
          })}
        </Section>
      )}
    </>
  )
}

export default VotingRationaleSection
