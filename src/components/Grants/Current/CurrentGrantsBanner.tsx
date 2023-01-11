import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import isEmpty from 'lodash/isEmpty'

import { GrantWithUpdateAttributes } from '../../../entities/Proposal/types'
import { numberFormat } from '../../../modules/intl'
import Banner, { BannerType } from '../Banner'

const getBannerStats = (grants: GrantWithUpdateAttributes[]) => {
  if (isEmpty(grants)) {
    return {}
  }

  const releasedValues = grants.map((item) => {
    const releasedPercentage = ((item.contract?.released || 0) * 100) / (item.contract?.vesting_total_amount || 0)

    return ((item.size || 0) * releasedPercentage) / 100
  })

  const totalReleased = releasedValues.filter(Number).reduce((prev, next) => prev! + next!, 0) || 0
  const toBeVestedValues = grants.map(
    (item) => (item.contract?.vesting_total_amount || 0) - (item.contract?.vestedAmount || 0)
  )
  const totalToBeVested = toBeVestedValues.filter(Number).reduce((prev, next) => prev! + next!, 0) || 0

  return {
    totalGrants: grants.length,
    totalReleased,
    totalToBeVested,
  }
}

const CurrentGrantsBanner = ({ grants }: { grants: GrantWithUpdateAttributes[] }) => {
  const t = useFormatMessage()
  const bannerStats = useMemo(() => getBannerStats(grants), [grants])
  const bannerItems = useMemo(
    () => [
      {
        title: t('page.grants.current_banner.active_grants_title', { value: bannerStats.totalGrants }),
        description: t('page.grants.current_banner.active_grants_description'),
      },
      {
        title: t('page.grants.current_banner.released_title', {
          value: numberFormat.format(bannerStats.totalReleased || 0),
        }),
        description: t('page.grants.current_banner.released_description'),
      },
      {
        title: t('page.grants.current_banner.to_be_vested_title', {
          value: numberFormat.format(bannerStats.totalToBeVested || 0),
        }),
        description: t('page.grants.current_banner.to_be_vested_description'),
      },
    ],
    [bannerStats, t]
  )

  return (
    <Banner
      type={BannerType.Current}
      title={t('page.grants.current_banner.title')}
      description={t('page.grants.current_banner.description')}
      items={bannerItems}
    />
  )
}

export default CurrentGrantsBanner
