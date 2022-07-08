import React, { useCallback, useEffect, useState } from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Table } from 'decentraland-ui/dist/components/Table/Table'
import { isEmpty } from 'lodash'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'

import Banner, { BannerType } from '../components/Grants/Banner'
import CurrentGrantsList from '../components/Grants/CurrentGrantsList'
import GrantsPastItem from '../components/Grants/GrantsPastItem'
import Sort from '../components/Icon/Sort'
import BurgerMenuContent from '../components/Layout/BurgerMenu/BurgerMenuContent'
import BurgerMenuPushableLayout from '../components/Layout/BurgerMenu/BurgerMenuPushableLayout'
import LoadingView from '../components/Layout/LoadingView'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import { GrantAttributes } from '../entities/Proposal/types'
import useGrants from '../hooks/useGrants'
import { useSortingByKey } from '../hooks/useSortingByKey'
import { isUnderMaintenance } from '../modules/maintenance'

import './grants.css'

const PAST_GRANTS_PER_PAGE = 10

const formatter = Intl.NumberFormat('en', { notation: 'compact' })

export default function GrantsPage() {
  const t = useFormatMessage()
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })
  const { grants, isLoadingGrants } = useGrants()
  const [filteredPastGrants, setFilteredPastGrants] = useState<GrantAttributes[]>([])
  const { sorted: sortedPastGrants, changeSort, isDescendingSort } = useSortingByKey(filteredPastGrants, 'enacted_at')

  const handleLoadMorePastGrantsClick = useCallback(() => {
    if (grants) {
      const newPastGrants = grants.past.slice(0, filteredPastGrants.length + PAST_GRANTS_PER_PAGE)
      setFilteredPastGrants(newPastGrants)
    }
  }, [grants, filteredPastGrants?.length])

  useEffect(() => {
    if (!isEmpty(grants) && isEmpty(filteredPastGrants)) {
      setFilteredPastGrants(grants.past.slice(0, PAST_GRANTS_PER_PAGE))
    }
  }, [grants, filteredPastGrants])

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
              {!isEmpty(grants.current) && <CurrentGrantsList grants={grants.current} />}
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
