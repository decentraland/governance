import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import useVotingStats from '../../hooks/useVotingStats'

import { UserStatBox } from './UserStatBox'
import './UserVotingStats.css'

interface Props {
  address: string
}

export default function UserVotingStats({ address }: Props) {
  const t = useFormatMessage()

  const { participationPercentage, participationTotal, personalMatchPercentage, outcomeMatchPercentage, isLoading } =
    useVotingStats(address)

  return (
    <Container className="UserVotingStats__Container">
      <UserStatBox title={t('page.profile.user_voting_stats.participation_label')} loading={isLoading}>
        <div className="UserVotingStats__Data">
          <span className="UserVotingStats__MainData">
            {t('page.profile.user_voting_stats.participation_total_label', { count: participationTotal })}
          </span>
          <span className="UserVotingStats__Sub">
            {t('page.profile.user_voting_stats.participation_percentage_label', {
              percentage: participationPercentage,
            })}
          </span>
        </div>
      </UserStatBox>
      <UserStatBox
        title={t('page.profile.user_voting_stats.personal_match_label')}
        info={t('page.profile.user_voting_stats.personal_match_info')}
        loading={isLoading}
      >
        <div className="UserVotingStats__Data">
          <span className="UserVotingStats__MainData">
            {t('page.profile.user_voting_stats.personal_match_percentage_label', {
              percentage: personalMatchPercentage,
            })}
          </span>
          <span className="UserVotingStats__Sub">{t('page.profile.user_voting_stats.personal_match_conclusion')}</span>
        </div>
      </UserStatBox>
      <UserStatBox
        title={t('page.profile.user_voting_stats.outcome_match_label')}
        info={t('page.profile.user_voting_stats.outcome_match_info')}
        loading={isLoading}
      >
        <div className="UserVotingStats__Data">
          <span className="UserVotingStats__MainData">
            {t('page.profile.user_voting_stats.outcome_percentage_label', { percentage: outcomeMatchPercentage })}
          </span>
          <span className="UserVotingStats__Sub">{t('page.profile.user_voting_stats.outcome_match_conclusion')}</span>
        </div>
      </UserStatBox>
    </Container>
  )
}
