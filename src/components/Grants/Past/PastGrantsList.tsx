import React, { useCallback, useEffect, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import isEmpty from 'lodash/isEmpty'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'

import { TransparencyGrant } from '../../../entities/Proposal/types'
import { useSortingByKey } from '../../../hooks/useSortingByKey'
import FullWidthButton from '../../Common/FullWidthButton'

import PastGrantCard from './PastGrantCard'
import PastGrantsBanner from './PastGrantsBanner'
import './PastGrantsList.css'
import PastGrantsTable from './PastGrantsTable'

const PAST_GRANTS_PER_PAGE = 10

interface Props {
  grants: TransparencyGrant[]
  currentGrantsTotal: number
  totalGrants: number
}

const PastGrantsList = ({ grants, currentGrantsTotal, totalGrants }: Props) => {
  const t = useFormatMessage()
  const [filteredPastGrants, setFilteredPastGrants] = useState<TransparencyGrant[]>([])
  const {
    sorted: sortedPastGrants,
    changeSort,
    setIsDescending,
    isDescendingSort,
  } = useSortingByKey(filteredPastGrants, 'enacted_at')
  const responsive = useResponsive()
  const showTable = responsive({ minWidth: Responsive.onlyComputer.minWidth })

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

      {!showTable ? (
        <>
          <div className="PastGrantsList__Header">
            <h2 className="PastGrantsList__Title">{t('page.grants.past_funded.title')}</h2>
            <Dropdown
              className="PastGrantsSortingMenu"
              direction="right"
              text={isDescendingSort ? t('page.grants.past_funded.newest') : t('page.grants.past_funded.oldest')}
            >
              <Dropdown.Menu>
                <Dropdown.Item text={t('page.grants.past_funded.oldest')} onClick={() => setIsDescending(false)} />
                <Dropdown.Item text={t('page.grants.past_funded.newest')} onClick={() => setIsDescending(true)} />
              </Dropdown.Menu>
            </Dropdown>
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
        <FullWidthButton onClick={handleLoadMorePastGrantsClick}>{t('page.grants.load_more_button')}</FullWidthButton>
      )}
    </>
  )
}

export default PastGrantsList
