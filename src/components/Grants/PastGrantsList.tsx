import React, { useCallback, useEffect, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { isEmpty } from 'lodash'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'

import { GrantAttributes } from '../../entities/Proposal/types'
import { useSortingByKey } from '../../hooks/useSortingByKey'
import Sort from '../Icon/Sort'

import PastGrantCard from './PastGrantCard'
import PastGrantsBanner from './PastGrantsBanner'
import './PastGrantsList.css'
import PastGrantsTable from './PastGrantsTable'

const PAST_GRANTS_PER_PAGE = 10

interface Props {
  grants: GrantAttributes[]
  currentGrantsTotal: number
  totalGrants: number
}

const PastGrantsList = ({ grants, currentGrantsTotal, totalGrants }: Props) => {
  const t = useFormatMessage()
  const [filteredPastGrants, setFilteredPastGrants] = useState<GrantAttributes[]>([])
  const { sorted: sortedPastGrants, changeSort, isDescendingSort } = useSortingByKey(filteredPastGrants, 'enacted_at')
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })

  const handleLoadMorePastGrantsClick = useCallback(() => {
    if (grants) {
      const newPastGrants = grants.slice(0, filteredPastGrants.length + PAST_GRANTS_PER_PAGE)
      setFilteredPastGrants(newPastGrants)
    }
  }, [grants, filteredPastGrants?.length])

  useEffect(() => {
    if (!isEmpty(grants) && isEmpty(filteredPastGrants)) {
      setFilteredPastGrants(grants.slice(0, PAST_GRANTS_PER_PAGE))
    }
  }, [grants, filteredPastGrants])

  const showLoadMorePastGrantsButton = filteredPastGrants.length !== grants.length

  return (
    <>
      <PastGrantsBanner grants={grants} currentGrantsTotal={currentGrantsTotal} totalGrants={totalGrants} />

      {isMobile ? (
        <>
          <div className="PastGrantsList__Header">
            <h2 className="PastGrantsList__Title">{t('page.grants.past_funded.title')}</h2>
            <div onClick={changeSort} className="PastGrantsList_Sort">
              <span>
                {t('page.grants.past_funded.start_date')}
                <Sort rotate={isDescendingSort ? 0 : 180} color={'--background-remove-poi'} />
              </span>
            </div>
          </div>
          <Container className="PastGrantsList__Container">
            {sortedPastGrants.map((grant) => (
              <PastGrantCard key={`PastGrantCard_${grant.id}`} grant={grant} />
            ))}
          </Container>
        </>
      ) : (
        <PastGrantsTable sortedGrants={sortedPastGrants} onSortClick={changeSort} isDescendingSort={isDescendingSort} />
      )}

      {showLoadMorePastGrantsButton && (
        <Button primary fluid className="GrantsPage_LoadMoreButton" onClick={handleLoadMorePastGrantsClick}>
          {t('page.grants.load_more_button')}
        </Button>
      )}
    </>
  )
}

export default PastGrantsList
