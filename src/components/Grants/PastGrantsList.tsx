import React, { useCallback, useEffect, useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Table } from 'decentraland-ui/dist/components/Table/Table'
import { isEmpty } from 'lodash'

import { GrantAttributes } from '../../entities/Proposal/types'
import { useSortingByKey } from '../../hooks/useSortingByKey'
import { numberFormat } from '../../modules/intl'
import Sort from '../Icon/Sort'

import Banner, { BannerType } from './Banner'
import GrantsPastItem from './GrantsPastItem'

const PAST_GRANTS_PER_PAGE = 10

const getBannerStats = (grants: GrantAttributes[], currentGrantsTotal: number, totalGrants: number) => {
  if (isEmpty(grants)) {
    return {}
  }

  const totalProjects = grants.length
  const sizes = grants.map((item) => item.size)
  const totalFunding = sizes.reduce((prev, next) => prev + next, 0)
  const approvedPercentage = Math.round(((currentGrantsTotal + totalProjects) * 100) / totalGrants)

  return {
    totalProjects,
    totalFunding,
    approvedPercentage,
  }
}

interface Props {
  grants: GrantAttributes[]
  currentGrantsTotal: number
  totalGrants: number
}

const PastGrantsList = ({ grants, currentGrantsTotal, totalGrants }: Props) => {
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

  const bannerStats = useMemo(
    () => getBannerStats(grants, currentGrantsTotal, totalGrants),
    [grants, currentGrantsTotal, totalGrants]
  )
  const bannerItems = useMemo(
    () => [
      {
        title: t('page.grants.past_banner.completed_grants_title', { value: bannerStats.totalProjects }),
        description: t('page.grants.past_banner.completed_grants_description'),
      },
      {
        title: t('page.grants.past_banner.total_funding_title', {
          value: numberFormat.format(bannerStats.totalFunding || 0),
        }),
        description: t('page.grants.past_banner.total_funding_description'),
      },
      {
        title: t('page.grants.past_banner.approved_rate_title', {
          value: numberFormat.format(bannerStats.approvedPercentage || 0),
        }),
        description: t('page.grants.past_banner.approved_rate_description'),
      },
    ],
    [bannerStats, t]
  )

  const showLoadMorePastGrantsButton = filteredPastGrants.length !== grants.length

  return (
    <>
      <Banner
        type={BannerType.Past}
        title={t('page.grants.past_banner.title')}
        description={t('page.grants.past_banner.description')}
        items={bannerItems}
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
