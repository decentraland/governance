import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import classNames from 'classnames'
import snakeCase from 'lodash/snakeCase'

import { ProjectStatus } from '../../../entities/Grant/types'
import { ProposalAttributes, ProposalType } from '../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import useAddressVotes from '../../../hooks/useAddressVotes'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useGovernanceProfile from '../../../hooks/useGovernanceProfile'
import useProfile from '../../../hooks/useProfile'
import useProposals from '../../../hooks/useProposals'
import useVestings from '../../../hooks/useVestings'
import useVotingStats from '../../../hooks/useVotingStats'
import Time from '../../../utils/date/Time'
import locations from '../../../utils/locations'
import { getContractDataFromTransparencyVesting } from '../../../utils/projects'
import FullWidthButton from '../../Common/FullWidthButton'
import InvertedButton from '../../Common/InvertedButton'
import Heading from '../../Common/Typography/Heading'
import Link from '../../Common/Typography/Link'
import Username from '../../Common/Username'
import GovernanceSidebar from '../../Sidebar/GovernanceSidebar'
import ValidatedProfileCheck from '../../User/ValidatedProfileCheck'

import './AuthorDetails.css'
import AuthorDetailsStat from './AuthorDetailsStat'
import ProjectCard from './ProjectCard'
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
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const { displayableAddress } = useProfile(address)

  const { data: vestings } = useVestings(hasPreviouslySubmittedGrants)
  const grantsWithVesting = useMemo(
    () =>
      grants?.data.map((grant) => {
        const vesting = vestings?.find((item) => grant.id === item.proposal_id)

        return {
          ...grant,
          ...getContractDataFromTransparencyVesting(vesting),
        }
      }) || [],
    [vestings, grants?.data]
  )
  const fundsVested = useMemo(
    () => grantsWithVesting?.reduce((total, grant) => total + (grant?.contract?.vestedAmount || 0), 0),
    [grantsWithVesting]
  )

  const projectPerformanceTotals = useMemo(
    () =>
      SHOWN_PERFORMANCE_STATUSES.reduce((acc, cur) => {
        const items = grantsWithVesting?.filter((item) => item.status === cur)
        const total = items?.length || 0
        return total > 0 ? { ...acc, [cur]: { items, total } } : acc
      }, {} as Record<string, { items: any[]; total: number }>),
    [grantsWithVesting]
  )

  const projectPerformanceText = useMemo(
    () =>
      Object.keys(projectPerformanceTotals)
        .map((item) =>
          t(`page.proposal_detail.author_details.project_performance_${snakeCase(item)}`, {
            total: projectPerformanceTotals[item].total,
          })
        )
        .join(', '),
    [projectPerformanceTotals, t]
  )

  const { votes } = useAddressVotes(address)
  const hasVoted = votes && votes.length > 0
  const activeSinceFormattedDate = hasVoted ? Time.unix(votes[0].created).format('MMMM, YYYY') : ''

  const handleClose = () => setIsSidebarVisible(false)

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
            {hasVoted && (
              <span className="AuthorDetails__ActiveSince">
                {t('page.proposal_detail.author_details.active_since', { date: activeSinceFormattedDate })}
              </span>
            )}
          </div>
        </div>
        <Link href={locations.profile({ address })}>
          <InvertedButton>{t('page.proposal_detail.author_details.view_profile')}</InvertedButton>
        </Link>
      </div>
      <div
        className={classNames(
          'AuthorDetails__StatsContainer',
          hasPreviouslySubmittedGrants && 'AuthorDetails__StatsContainer--clickable'
        )}
        onClick={() => setIsSidebarVisible(true)}
      >
        {!hasPreviouslySubmittedGrants && (
          <AuthorDetailsStat
            label={t('page.proposal_detail.author_details.grant_stats_label')}
            description={t('page.proposal_detail.author_details.first_grant_description')}
          />
        )}
        {hasPreviouslySubmittedGrants && (
          <>
            <AuthorDetailsStat
              label={t('page.proposal_detail.author_details.funds_vested_label')}
              description={intl.formatNumber(fundsVested || 0, CURRENCY_FORMAT_OPTIONS)}
            />
            <AuthorDetailsStat
              label={t('page.proposal_detail.author_details.grant_stats_label')}
              description={t('page.proposal_detail.author_details.grant_stats_description', {
                total: grants.total,
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
      <GovernanceSidebar
        title={t('page.proposal_detail.author_details.sidebar.title', { username: displayableAddress })}
        visible={isSidebarVisible}
        onClose={handleClose}
      >
        <div>
          <div className="AuthorDetails__SidebarList">
            {projectPerformanceTotals &&
              Object.keys(projectPerformanceTotals).map((item) => {
                const items = projectPerformanceTotals[item].items

                return (
                  <div key={item}>
                    <Heading size="2xs" weight="semi-bold">
                      {t('page.proposal_detail.author_details.sidebar.subtitle', { total: items.length, status: item })}
                    </Heading>
                    {items.map((item: ProposalAttributes) => (
                      <ProjectCard key={item.id} proposal={item} />
                    ))}
                  </div>
                )
              })}
          </div>
          <FullWidthButton href={locations.profile({ address })}>
            {t('page.proposal_detail.author_details.sidebar.view_profile')}
          </FullWidthButton>
        </div>
      </GovernanceSidebar>
    </Section>
  )
}
