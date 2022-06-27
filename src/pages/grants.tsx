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
import GrantCard from '../components/Grants/GrantCard'
import GrantsPastItem from '../components/Grants/GrantsPastItem'
import BurgerMenuContent from '../components/Layout/BurgerMenu/BurgerMenuContent'
import BurgerMenuPushableLayout from '../components/Layout/BurgerMenu/BurgerMenuPushableLayout'
import LoadingView from '../components/Layout/LoadingView'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import { GrantAttributes } from '../entities/Proposal/types'
import useGrants from '../hooks/useGrants'
import { isUnderMaintenance } from '../modules/maintenance'

import './grants.css'

const CURRENT_GRANTS_PER_PAGE = 8
const PAST_GRANTS_PER_PAGE = 10

export default function GrantsPage() {
  const t = useFormatMessage()
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })

  const { grants, isLoadingGrants } = useGrants()
  const [filteredCurrentGrants, setFilteredCurrentGrants] = useState<GrantAttributes[]>([])
  const [filteredPastGrants, setFilteredPastGrants] = useState<GrantAttributes[]>([])

  const handleLoadMoreCurrentGrantsClick = useCallback(() => {
    if (grants) {
      const newCurrentGrants = grants.current.slice(0, filteredCurrentGrants.length + CURRENT_GRANTS_PER_PAGE)
      setFilteredCurrentGrants(newCurrentGrants)
    }
  }, [grants, filteredCurrentGrants.length])

  const handleLoadMorePastGrantsClick = useCallback(() => {
    if (grants) {
      const newPastGrants = grants.past.slice(0, filteredPastGrants.length + PAST_GRANTS_PER_PAGE)
      setFilteredPastGrants(newPastGrants)
    }
  }, [grants, filteredPastGrants.length])

  useEffect(() => {
    if (!isEmpty(grants)) {
      setFilteredCurrentGrants(grants.current.slice(0, CURRENT_GRANTS_PER_PAGE))
      setFilteredPastGrants(grants.past.slice(0, PAST_GRANTS_PER_PAGE))
    }
  }, [grants])

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

  const isLoading = isEmpty(grants) && isLoadingGrants

  const getCurrentBannerItems = () => {
    if (isLoading) {
      return []
    }

    return [
      { title: `${grants.current.length} projects open`, description: 'Initiatives currently being funded' },
      { title: '$2.5 million USD released', description: 'Funding so far, for current batch' },
      { title: '$1.3 million USD to go', description: 'To be released for current batch' },
    ]
  }

  const getPastBannerItems = () => {
    if (isLoading) {
      return []
    }

    return [
      { title: `${grants.past.length} projects`, description: 'Initiatives successfully funded' },
      { title: '$4.5 million USD', description: 'Aggregated funding for past initiatives' },
      { title: '$1.3M per month', description: 'Avg. funding since Feb 2021' },
    ]
  }

  const showLoadMoreCurrentGrantsButton = filteredCurrentGrants.length !== grants?.current?.length
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
                    <Container className="GrantsPage__CurrentGrantsContainer">
                      {grants.current.map((grant) => (
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
                        <Table.HeaderCell className="GrantsPage__PastGrantsTableHeader GrantsPage__PastGrantsTableHeaderCategory">
                          {t('page.grants.past_funded.start_date')}
                        </Table.HeaderCell>
                        <Table.HeaderCell className="GrantsPage__PastGrantsTableHeader GrantsPage__PastGrantsTableHeaderCategory">
                          {t('page.grants.past_funded.size')}
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {grants.past.map((grant, index) => (
                        <>
                          <GrantsPastItem grant={grant} />
                          {grants.past.length - 1 !== index && <tr className="GrantsPage__PastGrantsSeparator" />}
                        </>
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
