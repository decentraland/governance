import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { ProjectStatus } from '../../../entities/Grant/types'
import { ProposalType } from '../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useGovernanceProfile from '../../../hooks/useGovernanceProfile'
import useProposals from '../../../hooks/useProposals'
import useVestings from '../../../hooks/useVestings'
import useVotingStats from '../../../hooks/useVotingStats'
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

export default function AuthorDetails({ address }: Props) {
  const t = useFormatMessage()
  const { profile, isLoadingGovernanceProfile } = useGovernanceProfile(address)
  const { participationTotal } = useVotingStats(address)
  const { proposals: grants } = useProposals({ user: address, type: ProposalType.Grant })
  const intl = useIntl()
  const hasPreviouslySubmittedGrants = !!grants && grants?.total > 0

  const { data: vestings } = useVestings(hasPreviouslySubmittedGrants)
  const grantsWithVesting = useMemo(
    () =>
      grants?.data.map((grant) => {
        const vesting = vestings?.find((item) => grant.id === item.proposal_id)

        return {
          ...grant,
          vesting_released: vesting?.vesting_released || 0,
          vesting_status: vesting?.vesting_status,
        }
      }),
    [vestings, grants?.data]
  )
  const fundsReleased = useMemo(
    () => grantsWithVesting?.reduce((total, grant) => total + grant.vesting_released, 0),
    [grantsWithVesting]
  )
  const finishedProjects = useMemo(
    () => grantsWithVesting?.filter((item) => item.vesting_status === ProjectStatus.Finished),
    [grantsWithVesting]
  )

  return (
    <Section title={t('page.proposal_detail.author_details.title')}>
      <div className="AuthorDetails__UserContainer">
        <div className="AuthorDetails__UserInfo">
          <Username className="AuthorDetails__Avatar" variant="avatar" address={address} size="big" />
          <div className="AuthorDetails__Username">
            <Username className="AuthorDetails__Address" variant="address" address={address} size="big" />
            <div className="AuthorDetails__ValidatedIcon">
              <ValidatedProfileCheck forumUsername={profile?.forum_username} isLoading={isLoadingGovernanceProfile} />
            </div>
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
            <AuthorDetailsStat
              label={t('page.proposal_detail.author_details.project_performance_label')}
              description={t('page.proposal_detail.author_details.project_performance_description', {
                total: finishedProjects?.length,
              })}
            />
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
