import { useCallback, useEffect } from 'react'

import { useLocation } from '@reach/router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { useTabletAndBelowMediaQuery } from 'decentraland-ui/dist/components/Media/Media'
import { Pagination } from 'decentraland-ui/dist/components/Pagination/Pagination'

import RandomBanner from '../components/Banner/RandomBanner'
import CategoryBanner from '../components/Category/CategoryBanner'
import Empty from '../components/Common/Empty'
import Mobile from '../components/Common/MediaQuery/Mobile'
import NotMobile from '../components/Common/MediaQuery/NotMobile'
import ProposalPreviewCard from '../components/Common/ProposalPreviewCard/ProposalPreviewCard'
import Link from '../components/Common/Typography/Link'
import Text from '../components/Common/Typography/Text'
import WiderContainer from '../components/Common/WiderContainer'
import ActionableLayout from '../components/Layout/ActionableLayout'
import LoadingView from '../components/Layout/LoadingView'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import PriorityProposalsBox from '../components/Profile/PriorityProposalsBox'
import ProposalItem from '../components/Proposal/ProposalItem'
import CategoryFilter from '../components/Search/CategoryFilter'
import FilterMenu from '../components/Search/FilterMenu'
import SearchTitle from '../components/Search/SearchTitle'
import SortingMenu from '../components/Search/SortingMenu'
import StatusFilter from '../components/Search/StatusFilter'
import TimeFrameFilter from '../components/Search/TimeFrameFilter'
import { CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import useFormatMessage from '../hooks/useFormatMessage'
import useProposals from '../hooks/useProposals'
import useProposalsByCoAuthor from '../hooks/useProposalsByCoAuthor'
import useProposalsCachedVotes from '../hooks/useProposalsCachedVotes'
import { useProposalsSearchParams } from '../hooks/useProposalsSearchParams'
import locations, { navigate } from '../utils/locations'
import { isUnderMaintenance } from '../utils/maintenance'

import './proposals.css'

const ITEMS_PER_PAGE = 25

export default function ProposalsPage() {
  const t = useFormatMessage()
  const location = useLocation()
  const [userAddress, authState] = useAuthContext()
  const { type, subtype, status, search, searching, timeFrame, order, page, filtering } = useProposalsSearchParams()
  const { proposals, isLoadingProposals } = useProposals({
    type,
    subtype,
    status,
    page,
    search,
    timeFrame,
    order,
    itemsPerPage: ITEMS_PER_PAGE,
  })
  const proposalIds = (proposals?.data || []).map((proposal) => proposal.id)
  const { segmentedVotes, isLoadingVotes } = useProposalsCachedVotes(proposalIds)
  const isTabletAndBelow = useTabletAndBelowMediaQuery()

  const handlePageFilter = useCallback(
    (page: number) => {
      const newParams = new URLSearchParams(location.search)
      page !== 1 ? newParams.set('page', String(page)) : newParams.delete('page')
      return navigate(locations.proposals(newParams))
    },
    [location.search]
  )

  useEffect(() => {
    if (typeof proposals?.total === 'number') {
      const maxPage = Math.ceil(proposals.total / ITEMS_PER_PAGE)
      if (page > maxPage) {
        handlePageFilter(maxPage)
      }
    }
  }, [handlePageFilter, page, proposals])

  const [user] = useAuthContext()
  const { requestsStatus } = useProposalsByCoAuthor(user, CoauthorStatus.PENDING)

  const title =
    (type === ProposalType.Catalyst && t('page.proposal_catalyst_list.title')) ||
    (type === ProposalType.POI && t('page.proposal_poi_list.title')) ||
    (type === ProposalType.BanName && t('page.proposal_ban_name_list.title')) ||
    (type === ProposalType.Poll && t('page.proposal_poll_list.title')) ||
    t('page.proposal_list.title') ||
    ''

  const description =
    (type === ProposalType.Catalyst && t('page.proposal_catalyst_list.description')) ||
    (type === ProposalType.POI && t('page.proposal_poi_list.description')) ||
    (type === ProposalType.BanName && t('page.proposal_ban_name_list.description')) ||
    (type === ProposalType.Poll && t('page.proposal_poll_list.description')) ||
    t('page.proposal_list.description') ||
    ''

  if (isUnderMaintenance()) {
    return <MaintenanceLayout title={title} description={description} activeTab={NavigationTab.Proposals} />
  }

  const isLoading = !proposals || isLoadingProposals || isLoadingVotes || authState.loading

  return (
    <>
      <Mobile>
        <RandomBanner isVisible={!searching} />
      </Mobile>
      <Head title={title} description={description} image="https://decentraland.org/images/decentraland.png" />
      <Navigation activeTab={NavigationTab.Proposals} />
      <WiderContainer>
        {isLoading && <LoadingView />}
        {!isLoading && (
          <>
            <div className="OnlyDesktop">
              <RandomBanner isVisible={!searching} />
            </div>
            {search && (
              <NotMobile>
                <SearchTitle />
              </NotMobile>
            )}
            <div className="ProposalsPage__Container">
              <div className="ProposalsPage__Sidebar">
                <NotMobile>
                  <div>
                    <CategoryFilter filterType={ProposalType} />
                    <StatusFilter statusType={ProposalStatus} />
                    <TimeFrameFilter />
                  </div>
                </NotMobile>
              </div>
              <div className="ProposalsPage__Content">
                {searching && (
                  <Mobile>
                    <SearchTitle />
                  </Mobile>
                )}
                {!filtering && <PriorityProposalsBox address={userAddress} collapsible />}
                <ActionableLayout
                  leftAction={
                    <Text color="secondary" weight="semi-bold" className="ProposalsPage__ProposalCount">
                      {t('general.count_proposals', { count: proposals?.total || 0 })}
                    </Text>
                  }
                  rightAction={
                    <>
                      <SortingMenu />
                      <Mobile>
                        <FilterMenu>
                          <CategoryFilter filterType={ProposalType} />
                          <StatusFilter statusType={ProposalStatus} />
                          <TimeFrameFilter />
                        </FilterMenu>
                      </Mobile>
                      <Button
                        primary
                        size="small"
                        className="ProposalsPage__SubmitButton"
                        as={Link}
                        href={locations.submit()}
                      >
                        {t('page.proposal_list.new_proposal')}
                      </Button>
                    </>
                  }
                >
                  {isLoading && (
                    <div className="ProposalsPage__LoaderContainer">
                      <Loader size="medium" active={isLoading} />
                    </div>
                  )}
                  {!isLoading && (
                    <>
                      {type && !searching && <CategoryBanner type={type} />}
                      {proposals && proposals.data.length === 0 && (
                        <Empty
                          className="ProposalsPage__Empty"
                          description={
                            searching || status || timeFrame?.length > 0
                              ? t('navigation.search.no_matches')
                              : t('page.proposal_list.no_proposals_yet')
                          }
                        />
                      )}
                      {proposals && (
                        <div className="ProposalsPage__List">
                          {proposals.data.map((proposal) => {
                            return isTabletAndBelow ? (
                              <ProposalItem
                                key={proposal.id}
                                proposal={proposal}
                                hasCoauthorRequest={!!requestsStatus.find((req) => req.proposal_id === proposal.id)}
                                votes={segmentedVotes ? segmentedVotes[proposal.id]?.highQualityVotes : undefined}
                              />
                            ) : (
                              <ProposalPreviewCard
                                key={proposal.id}
                                proposal={proposal}
                                votes={segmentedVotes ? segmentedVotes[proposal.id]?.highQualityVotes : undefined}
                                variant="category"
                              />
                            )
                          })}
                        </div>
                      )}
                      {proposals && proposals.total > ITEMS_PER_PAGE && (
                        <Pagination
                          onPageChange={(e, { activePage }) => handlePageFilter(activePage as number)}
                          totalPages={Math.ceil(proposals.total / ITEMS_PER_PAGE)}
                          activePage={page}
                          firstItem={null}
                          lastItem={null}
                        />
                      )}
                    </>
                  )}
                </ActionableLayout>
              </div>
            </div>
          </>
        )}
      </WiderContainer>
    </>
  )
}
