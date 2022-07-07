import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import { Table } from 'decentraland-ui/dist/components/Table/Table'
import { filter, isEmpty, orderBy } from 'lodash'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'

import Banner, { BannerType } from '../components/Grants/Banner'
import FilterButton from '../components/Grants/FilterButton'
import GrantCard from '../components/Grants/GrantCard'
import GrantsPastItem from '../components/Grants/GrantsPastItem'
import Sort from '../components/Icon/Sort'
import BurgerMenuContent from '../components/Layout/BurgerMenu/BurgerMenuContent'
import BurgerMenuPushableLayout from '../components/Layout/BurgerMenu/BurgerMenuPushableLayout'
import LoadingView from '../components/Layout/LoadingView'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import { GrantAttributes, GrantWithUpdateAttributes, ProposalGrantCategory } from '../entities/Proposal/types'
import useGrants from '../hooks/useGrants'
import { useSortingByKey } from '../hooks/useSortingByKey'
import { isUnderMaintenance } from '../modules/maintenance'

import './grants.css'

const PROPOSAL_GRANT_CATEGORY_ALL = 'All'
const CURRENT_GRANTS_PER_PAGE = 8
const PAST_GRANTS_PER_PAGE = 10
type GrantCategoryFilter = ProposalGrantCategory | typeof PROPOSAL_GRANT_CATEGORY_ALL
const GRANTS_CATEGORY_FILTERS: GrantCategoryFilter[] = [
  PROPOSAL_GRANT_CATEGORY_ALL,
  ProposalGrantCategory.Community,
  ProposalGrantCategory.Gaming,
  ProposalGrantCategory.ContentCreator,
  ProposalGrantCategory.PlatformContributor,
]

const formatter = Intl.NumberFormat('en', { notation: 'compact' })

const useCurrentGrantsFilteredByCategory = (grants: GrantWithUpdateAttributes[]) =>
  useMemo(
    () => ({
      [PROPOSAL_GRANT_CATEGORY_ALL]: grants,
      [ProposalGrantCategory.Community]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.Community
      ),
      [ProposalGrantCategory.Gaming]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.Gaming
      ),
      [ProposalGrantCategory.PlatformContributor]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.PlatformContributor
      ),
      [ProposalGrantCategory.ContentCreator]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.ContentCreator
      ),
    }),
    [grants]
  )

export default function GrantsPage() {
  const t = useFormatMessage()
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })
  const { grants, isLoadingGrants } = useGrants()
  const [filteredCurrentGrants, setFilteredCurrentGrants] = useState<GrantWithUpdateAttributes[]>([])
  const [filteredPastGrants, setFilteredPastGrants] = useState<GrantAttributes[]>([])
  const [selectedCategory, setSelectedCategory] = useState<GrantCategoryFilter>(PROPOSAL_GRANT_CATEGORY_ALL)
  const [sortingKey, setSortingKey] = useState('created_at')
  const { sorted: sortedPastGrants, changeSort, isDescendingSort } = useSortingByKey(filteredPastGrants, 'enacted_at')
  const sortedCurrentGrants = useMemo(() => orderBy(grants.current, [sortingKey], ['desc']), [grants, sortingKey])
  const currentGrantsFilteredByCategory = useCurrentGrantsFilteredByCategory(sortedCurrentGrants)

  const handleLoadMoreCurrentGrantsClick = useCallback(() => {
    if (grants) {
      const newCurrentGrants = currentGrantsFilteredByCategory[selectedCategory].slice(
        0,
        filteredCurrentGrants.length + CURRENT_GRANTS_PER_PAGE
      )
      setFilteredCurrentGrants(newCurrentGrants)
    }
  }, [grants, currentGrantsFilteredByCategory, selectedCategory, filteredCurrentGrants])

  const handleLoadMorePastGrantsClick = useCallback(() => {
    if (grants) {
      const newPastGrants = grants.past.slice(0, filteredPastGrants.length + PAST_GRANTS_PER_PAGE)
      setFilteredPastGrants(newPastGrants)
    }
  }, [grants, filteredPastGrants?.length])

  useEffect(() => {
    if (!isEmpty(grants)) {
      setFilteredCurrentGrants(sortedCurrentGrants.slice(0, CURRENT_GRANTS_PER_PAGE))
    }
  }, [grants, sortedCurrentGrants])

  useEffect(() => {
    if (!isEmpty(grants) && isEmpty(filteredPastGrants)) {
      setFilteredPastGrants(grants.past.slice(0, PAST_GRANTS_PER_PAGE))
    }
  }, [grants, filteredPastGrants])

  useEffect(() => {
    if (!isEmpty(sortedCurrentGrants) && selectedCategory) {
      const newGrants =
        selectedCategory === PROPOSAL_GRANT_CATEGORY_ALL
          ? sortedCurrentGrants.slice(0, CURRENT_GRANTS_PER_PAGE)
          : filter(sortedCurrentGrants, (item) => item.configuration.category === selectedCategory).slice(
              0,
              CURRENT_GRANTS_PER_PAGE
            )
      setFilteredCurrentGrants(newGrants)
    }
  }, [sortedCurrentGrants, selectedCategory])

  const getPastBannerItems = () => {
    if (isEmpty(grants)) {
      return []
    }

    const totalProjects = grants.past.length
    const sizes = grants.past.map((item) => item.size)
    const totalFunding = sizes.reduce((prev, next) => prev + next, 0)
    const approvedPercentage = Math.round(((grants.current.length + grants.past.length) * 100) / grants.total)

    return [
      { title: `${totalProjects} Projects`, description: 'Successfully completed Grants' },
      {
        title: `$${formatter.format(totalFunding)} USD`,
        description: 'Total funding for past initiatives',
      },
      { title: `${approvedPercentage}% Approval`, description: 'Rate of approved Grant proposals' },
    ]
  }

  const isLoading = isEmpty(grants) && isLoadingGrants

  const getCurrentBannerItems = () => {
    if (isEmpty(grants)) {
      return []
    }

    const releasedValues = grants.current.map((item) => {
      if (item.configuration.tier === 'Tier 1' || item.configuration.tier === 'Tier 2') {
        return item.size
      }

      const releasedPercentage = ((item.contract?.released || 0) * 100) / (item.contract?.vesting_total_amount || 0)

      return ((item.size || 0) * releasedPercentage) / 100
    })

    const totalReleased = releasedValues.filter(Number).reduce((prev, next) => prev! + next!, 0) || 0
    const toBeVestedValues = grants.current.map(
      (item) => (item.contract?.vesting_total_amount || 0) - (item.contract?.vestedAmount || 0)
    )
    const totalToBeVested = toBeVestedValues.filter(Number).reduce((prev, next) => prev! + next!, 0) || 0

    return [
      { title: `${grants.current.length} Active Grants`, description: 'Initiatives currently being funded' },
      {
        title: `$${formatter.format(totalReleased)} USD Released`,
        description: 'Funds already cashed out by Grant teams',
      },
      {
        title: `$${formatter.format(totalToBeVested)} USD to be Vested`,
        description: 'Funds to be made available for active Grants',
      },
    ]
  }

  if (isUnderMaintenance()) {
    return (
      <>
        <Head
          title={t('page.grants.title') || ''}
          description={t('page.grants.description') || ''}
          image="https://decentraland.org/images/decentraland.png"
        />
        <Navigation activeTab={NavigationTab.Grants} />
        <MaintenancePage />
      </>
    )
  }

  const showLoadMoreCurrentGrantsButton =
    filteredCurrentGrants?.length !== currentGrantsFilteredByCategory[selectedCategory]?.length
  const showLoadMorePastGrantsButton = filteredPastGrants.length !== grants?.past?.length

  return (
    <div>
      <Head
        title={t('page.grants.title') || ''}
        description={t('page.grants.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Grants} />
      {isLoading && <LoadingView withNavigation />}
      {!isLoading && (
        <>
          {isMobile && <BurgerMenuContent className="Padded" navigationOnly={true} activeTab={NavigationTab.Grants} />}
          <BurgerMenuPushableLayout>
            <Container>
              {!isEmpty(grants.current) && (
                <>
                  <Banner
                    type={BannerType.Current}
                    title={t('page.grants.current_banner.title')}
                    description={t('page.grants.current_banner.description')}
                    items={getCurrentBannerItems()}
                  />
                  <div>
                    <h2 className="GrantsPage__CurrentGrantsTitle">{t('page.grants.currently_funded')}</h2>
                    <div className="GrantsPage__CurrentGrantsFilters">
                      <div className="GrantsPage__CurrentGrantsCategoryFilters">
                        {GRANTS_CATEGORY_FILTERS.map((item) => (
                          <FilterButton
                            key={item}
                            selected={selectedCategory === item}
                            onClick={() => setSelectedCategory(item)}
                            count={currentGrantsFilteredByCategory[item]?.length}
                          >
                            {t(`page.grants.category_filters.${item.split(' ')[0].toLowerCase()}`)}
                          </FilterButton>
                        ))}
                      </div>
                      <Dropdown
                        direction="left"
                        text={
                          sortingKey === 'created_at'
                            ? t('page.grants.sorting_filters.created_at')
                            : t('page.grants.sorting_filters.amount')
                        }
                      >
                        <Dropdown.Menu>
                          <Dropdown.Item
                            text={t('page.grants.sorting_filters.amount')}
                            onClick={() => setSortingKey('size')}
                          />
                          <Dropdown.Item
                            text={t('page.grants.sorting_filters.created_at')}
                            onClick={() => setSortingKey('created_at')}
                          />
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    <Container className="GrantsPage__CurrentGrantsContainer">
                      {filteredCurrentGrants?.map((grant) => (
                        <GrantCard key={`CurrentGrantCard_${grant.id}`} grant={grant} />
                      ))}
                    </Container>
                  </div>
                  {showLoadMoreCurrentGrantsButton && (
                    <Button
                      primary
                      fluid
                      className="GrantsPage_LoadMoreButton"
                      onClick={handleLoadMoreCurrentGrantsClick}
                    >
                      {t('page.grants.load_more_button')}
                    </Button>
                  )}
                </>
              )}
              {!isEmpty(grants.past) && (
                <>
                  <Banner
                    type={BannerType.Past}
                    title={t('page.grants.past_banner.title')}
                    description={t('page.grants.past_banner.description')}
                    items={getPastBannerItems()}
                  />
                  <Table basic="very">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell className="GrantsPage__PastGrantsTableHeader">
                          {t('page.grants.past_funded.title')}
                        </Table.HeaderCell>
                        <Table.HeaderCell className="GrantsPage__PastGrantsTableHeader GrantsPage__PastGrantsTableHeaderCategory">
                          {t('page.grants.past_funded.category')}
                        </Table.HeaderCell>
                        <Table.HeaderCell
                          className="GrantsPage__PastGrantsTableHeader GrantsPage__PastGrantsTableHeaderClickable GrantsPage__PastGrantsTableHeaderCategory"
                          onClick={changeSort}
                        >
                          <span>
                            {t('page.grants.past_funded.start_date')}
                            <Sort rotate={isDescendingSort ? 0 : 180} />
                          </span>
                        </Table.HeaderCell>
                        <Table.HeaderCell className="GrantsPage__PastGrantsTableHeader GrantsPage__PastGrantsTableHeaderCategory">
                          {t('page.grants.past_funded.size')}
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {sortedPastGrants.map((grant, index) => (
                        <GrantsPastItem
                          key={grant.id}
                          grant={grant}
                          showSeparator={sortedPastGrants.length - 1 !== index}
                        />
                      ))}
                    </Table.Body>
                  </Table>
                  {showLoadMorePastGrantsButton && (
                    <Button primary fluid className="GrantsPage_LoadMoreButton" onClick={handleLoadMorePastGrantsClick}>
                      {t('page.grants.load_more_button')}
                    </Button>
                  )}
                </>
              )}
            </Container>
          </BurgerMenuPushableLayout>
        </>
      )}
    </div>
  )
}
