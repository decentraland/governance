import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import classNames from 'classnames'
import snakeCase from 'lodash/snakeCase'
import upperFirst from 'lodash/upperFirst'

import { ProjectStatus } from '../../../entities/Grant/types'
import { Project, ProposalStatus, ProposalType } from '../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS, addressShortener, getEnumDisplayName } from '../../../helpers'
import useDclProfile from '../../../hooks/useDclProfile'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useGovernanceProfile from '../../../hooks/useGovernanceProfile'
import useProposals from '../../../hooks/useProposals'
import useVestings from '../../../hooks/useVestings'
import useVotesByAddress from '../../../hooks/useVotesByAddress'
import useVotingStats from '../../../hooks/useVotingStats'
import Time from '../../../utils/date/Time'
import locations from '../../../utils/locations'
import { createProject } from '../../../utils/projects'
import FullWidthButton from '../../Common/FullWidthButton'
import InvertedButton from '../../Common/InvertedButton'
import Heading from '../../Common/Typography/Heading'
import Link from '../../Common/Typography/Link'
import Username from '../../Common/Username'
import ChevronRight from '../../Icon/ChevronRight'
import GovernanceSidebar from '../../Sidebar/GovernanceSidebar'
import ValidatedProfileCheck from '../../User/ValidatedProfileCheck'

import './AuthorDetails.css'
import AuthorDetailsStat from './AuthorDetailsStat'
import GrantCardList from './GrantCardList'
import ProjectCardList from './ProjectCardList'
import Section from './Section'

interface Props {
  address: string
}

const SHOWN_PERFORMANCE_STATUSES = Object.values(ProjectStatus).filter((item) => item !== ProjectStatus.Pending)
const SHOWN_GRANT_REQUEST_STATUSES = [ProposalStatus.Passed, ProposalStatus.OutOfBudget, ProposalStatus.Rejected]

export default function AuthorDetails({ address }: Props) {
  const t = useFormatMessage()
  const { profile, isLoadingGovernanceProfile } = useGovernanceProfile(address)
  const { participationTotal } = useVotingStats(address)
  const { proposals: grants } = useProposals({ user: address, type: ProposalType.Grant })
  const intl = useIntl()
  const hasPreviouslySubmittedGrants = !!grants && grants?.total > 1
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const { profile: dclProfile } = useDclProfile(address)

  const { data: vestings } = useVestings(hasPreviouslySubmittedGrants)
  const projects = useMemo(
    () =>
      grants?.data.map((grant) =>
        createProject(
          grant,
          vestings?.find((item) => grant.id === item.proposal_id)
        )
      ) || [],
    [vestings, grants?.data]
  )
  const fundsVested = useMemo(
    () => projects?.reduce((total, grant) => total + (grant?.contract?.vestedAmount || 0), 0),
    [projects]
  )

  const projectsByStatus = useMemo(
    () =>
      SHOWN_PERFORMANCE_STATUSES.reduce((acc, cur) => {
        const items = projects?.filter((item) => item.status === cur)
        const total = items?.length || 0
        return total > 0 ? { ...acc, [cur]: { items, total } } : acc
      }, {} as Record<string, { items: Project[]; total: number }>),
    [projects]
  )

  const projectPerformanceText = useMemo(
    () =>
      Object.keys(projectsByStatus)
        .map((item) =>
          t(`page.proposal_detail.author_details.project_performance_${snakeCase(item)}`, {
            total: projectsByStatus[item].total,
          })
        )
        .join(', '),
    [projectsByStatus, t]
  )

  const { votes } = useVotesByAddress(address)
  const hasVoted = votes && votes.length > 0
  const activeSinceFormattedDate = hasVoted ? Time.unix(votes[0].created).format('MMMM, YYYY') : ''

  const hasGrants = grants && grants?.total > 1
  const handleClose = () => setIsSidebarVisible(false)

  return (
    <Section title={t('page.proposal_detail.author_details.title')} isNew>
      <div className="AuthorDetails__UserContainer">
        <div className="AuthorDetails__UserInfo">
          <Username className="AuthorDetails__Avatar" variant="avatar" address={address} size="xl" />
          <div>
            <div className="AuthorDetails__Username">
              <Username className="AuthorDetails__Address" variant="address" address={address} size="xl" />
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
        className={classNames('AuthorDetails__StatsContainer', hasGrants && 'AuthorDetails__StatsContainer--clickable')}
        onClick={() => hasGrants && setIsSidebarVisible(true)}
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
        {hasGrants && (
          <div className="AuthorDetails__Chevron">
            <ChevronRight color="var(--black-400)" />
          </div>
        )}
      </div>
      <GovernanceSidebar
        title={t('page.proposal_detail.author_details.sidebar.title', {
          username: dclProfile.username || addressShortener(address || ''),
        })}
        visible={isSidebarVisible}
        onClose={handleClose}
      >
        <div>
          <div className="AuthorDetails__SidebarList">
            {projectsByStatus &&
              Object.keys(projectsByStatus).map((item) => {
                const projects = projectsByStatus[item].items

                return (
                  <div key={item}>
                    <Heading size="2xs" weight="semi-bold">
                      {t('page.proposal_detail.author_details.sidebar.subtitle', {
                        total: projects.length,
                        status: item,
                      })}
                    </Heading>
                    <ProjectCardList projects={projects} />
                  </div>
                )
              })}
            {SHOWN_GRANT_REQUEST_STATUSES.map((status) => {
              const proposals = grants ? grants.data.filter((item) => item.status === status) : []

              if (proposals.length === 0) return null

              return (
                <div key={status}>
                  <Heading size="2xs" weight="semi-bold">
                    {t('page.proposal_detail.author_details.sidebar.subtitle', {
                      total: proposals.length,
                      status: upperFirst(getEnumDisplayName(status).toLowerCase()),
                    })}
                  </Heading>
                  <GrantCardList proposals={proposals} />
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
