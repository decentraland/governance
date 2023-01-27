import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import Banner, { BannerItem, BannerType } from '../Banner'

const CurrentGrantsBanner = () => {
  const t = useFormatMessage()
  const bannerItems: BannerItem[] = [
    {
      title: t('page.grants.current_banner.budget_title'),
      description: t('page.grants.current_banner.budget_description'),
      url: 'MISSING_URL',
    },
    {
      title: t('page.grants.current_banner.transparency_title'),
      description: t('page.grants.current_banner.transparency_description'),
      url: 'MISSING_URL',
    },
    {
      title: t('page.grants.current_banner.faq_title'),
      description: t('page.grants.current_banner.faq_description'),
      url: 'MISSING_URL',
    },
  ]

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
