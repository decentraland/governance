import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import snakeCase from 'lodash/snakeCase'

import { ProjectStatus } from '../../../entities/Grant/types'
import { ProposalType } from '../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import useAddressVotes from '../../../hooks/useAddressVotes'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useGovernanceProfile from '../../../hooks/useGovernanceProfile'
import useProposals from '../../../hooks/useProposals'
import useVestings from '../../../hooks/useVestings'
import useVotingStats from '../../../hooks/useVotingStats'
import Time from '../../../utils/date/Time'
import locations from '../../../utils/locations'
import InvertedButton from '../../Common/InvertedButton'
import Link from '../../Common/Typography/Link'
import Username from '../../Common/Username'
import ValidatedProfileCheck from '../../User/ValidatedProfileCheck'

import './AuthorDetails.css'
import AuthorDetailsStat from './AuthorDetailsStat'
import Section from './Section'

interface Props {
  address: string
}

const SHOWN_PERFORMANCE_STATUSES = Object.values(ProjectStatus).filter((item) => item !== ProjectStatus.Pending)

export default function AuthorDetails({ address }: Props) {
  const t = useFormatMessage()
  const { profile, isLoadingGovernanceProfile } = useGovernanceProfile(address)
  const { participationTotal } = useVotingStats(address)
  const { proposals: grants } = useProposals({ user: address, type: ProposalType.Grant })
  const intl = useIntl()
  const hasPreviouslySubmittedGrants = !!grants && grants?.total > 1

  const { data: vestings } = useVestings(hasPreviouslySubmittedGrants)
  const grantsWithVesting = useMemo(
    () =>
      grants?.data.map((grant) => {
        const vesting = vestings?.find((item) => grant.id === item.proposal_id)

        return {
          ...grant,
          vesting_released: vesting?.vesting_total_amount || 0,
          vesting_status: vesting?.vesting_status,
        }
      }),
    [vestings, grants?.data]
  )
  const fundsReleased = useMemo(
    () => grantsWithVesting?.reduce((total, grant) => total + grant.vesting_released, 0),
    [grantsWithVesting]
  )

  const projectPerformanceTotals = useMemo(
    () =>
      SHOWN_PERFORMANCE_STATUSES.reduce((acc, cur) => {
        const total = grantsWithVesting?.filter((item) => item.vesting_status === cur).length || 0
        return total > 0 ? { ...acc, [cur]: total } : acc
      }, {} as Record<string, number>),
    [grantsWithVesting]
  )

  const projectPerformanceText = useMemo(
    () =>
      Object.keys(projectPerformanceTotals)
        .map((item) =>
          t(`page.proposal_detail.author_details.project_performance_${snakeCase(item)}`, {
            total: projectPerformanceTotals[item],
          })
        )
        .join(', '),
    [projectPerformanceTotals, t]
  )

  const { votes } = useAddressVotes(address)
  const activeSinceFormattedDate = votes && votes.length > 0 ? Time.unix(votes[0].created).format('MMMM, YYYY') : ''

  return (
    <Section title={t('page.proposal_detail.author_details.title')} isNew>
      <div className="AuthorDetails__UserContainer">
        <div className="AuthorDetails__UserInfo">
          <Username className="AuthorDetails__Avatar" variant="avatar" address={address} size="big" />
          <div>
            <div className="AuthorDetails__Username">
              <Username className="AuthorDetails__Address" variant="address" address={address} size="big" />
              <div className="AuthorDetails__ValidatedIcon">
                <ValidatedProfileCheck forumUsername={profile?.forum_username} isLoading={isLoadingGovernanceProfile} />
              </div>
            </div>
            <span className="AuthorDetails__ActiveSince">
              {t('page.proposal_detail.author_details.active_since', { date: activeSinceFormattedDate })}
            </span>
          </div>
        </div>
        <Link href={locations.profile({ address })}>
          <InvertedButton>{t('page.proposal_detail.author_details.view_profile')}</InvertedButton>
        </Link>
      </div>
      <div className="AuthorDetails__StatsContainer">
        {!hasPreviouslySubmittedGrants && (
          <AuthorDetailsStat
            label={t('page.proposal_detail.author_details.grant_stats_label')}
            description={t('page.proposal_detail.author_details.first_grant_description')}
          />
        )}
        {hasPreviouslySubmittedGrants && (
          <>
            <AuthorDetailsStat
              label={t('page.proposal_detail.author_details.funds_granted_label')}
              description={intl.formatNumber(fundsReleased || 0, CURRENCY_FORMAT_OPTIONS)}
            />
            <AuthorDetailsStat
              label={t('page.proposal_detail.author_details.grant_stats_label')}
              description={t('page.proposal_detail.author_details.grant_stats_description', {
                total: grants.total - 1,
              })}
            />
            {projectPerformanceText && (
              <AuthorDetailsStat
                label={t('page.proposal_detail.author_details.project_performance_label')}
                description={projectPerformanceText}
              />
            )}
          </>
        )}
        <AuthorDetailsStat
          label={t('page.proposal_detail.author_details.30_day_participation_label')}
          description={t('page.proposal_detail.author_details.30_day_participation_description', {
            total: participationTotal,
          })}
        />
      </div>
    </Section>
  )
}
