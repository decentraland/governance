import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { isEmpty } from 'lodash'

import { GrantAttributes } from '../../entities/Proposal/types'
import { numberFormat } from '../../modules/intl'

import Banner, { BannerType } from './Banner'

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

const PastGrantsBanner = ({ grants, currentGrantsTotal, totalGrants }: Props) => {
  const t = useFormatMessage()

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

  return (
    <Banner
      type={BannerType.Past}
      title={t('page.grants.past_banner.title')}
      description={t('page.grants.past_banner.description')}
      items={bannerItems}
    />
  )
}

export default PastGrantsBanner
