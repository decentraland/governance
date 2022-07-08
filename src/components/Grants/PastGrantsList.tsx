import React, { useCallback, useEffect, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Table } from 'decentraland-ui/dist/components/Table/Table'
import { isEmpty } from 'lodash'

import { GrantAttributes } from '../../entities/Proposal/types'
import { useSortingByKey } from '../../hooks/useSortingByKey'
import Sort from '../Icon/Sort'

import Banner, { BannerType } from './Banner'
import GrantsPastItem from './GrantsPastItem'

const PAST_GRANTS_PER_PAGE = 10
const formatter = Intl.NumberFormat('en', { notation: 'compact' })

const PastGrantsList = ({
  grants,
  currentGrantsTotal,
  totalGrants,
}: {
  grants: GrantAttributes[]
  currentGrantsTotal: number
  totalGrants: number
}) => {
  const t = useFormatMessage()
  const [filteredPastGrants, setFilteredPastGrants] = useState<GrantAttributes[]>([])
  const { sorted: sortedPastGrants, changeSort, isDescendingSort } = useSortingByKey(filteredPastGrants, 'enacted_at')

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

  const getPastBannerItems = () => {
    if (isEmpty(grants)) {
      return []
    }

    const totalProjects = grants.length
    const sizes = grants.map((item) => item.size)
    const totalFunding = sizes.reduce((prev, next) => prev + next, 0)
    const approvedPercentage = Math.round(((currentGrantsTotal + grants.length) * 100) / totalGrants)

    return [
      { title: `${totalProjects} Projects`, description: 'Successfully completed Grants' },
      {
        title: `$${formatter.format(totalFunding)} USD`,
        description: 'Total funding for past initiatives',
      },
      { title: `${approvedPercentage}% Approval`, description: 'Rate of approved Grant proposals' },
    ]
  }

  const showLoadMorePastGrantsButton = filteredPastGrants.length !== grants.length

  return (
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
            <GrantsPastItem key={grant.id} grant={grant} showSeparator={sortedPastGrants.length - 1 !== index} />
          ))}
        </Table.Body>
      </Table>
      {showLoadMorePastGrantsButton && (
        <Button primary fluid className="GrantsPage_LoadMoreButton" onClick={handleLoadMorePastGrantsClick}>
          {t('page.grants.load_more_button')}
        </Button>
      )}
    </>
  )
}

export default PastGrantsList
