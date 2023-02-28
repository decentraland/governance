import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import Banner, { BannerItem, BannerType } from '../Banner'

const CurrentGrantsBanner = () => {
  const t = useFormatMessage()
  const bannerItems: BannerItem[] = [
    {
      title: t('page.grants.current_banner.budget_title'),
      description: t('page.grants.current_banner.budget_description'),
      url: 'https://governance.decentraland.org/proposal/?id=bfab7b70-7b75-11ed-ad27-015f26e7c35c',
    },
    {
      title: t('page.grants.current_banner.transparency_title'),
      description: t('page.grants.current_banner.transparency_description'),
      url: 'https://docs.google.com/spreadsheets/d/1FoV7TdMTVnqVOZoV4bvVdHWkeu4sMH5JEhp8L0Shjlo/edit#gid=1087165366',
    },
    {
      title: t('page.grants.current_banner.faq_title'),
      description: t('page.grants.current_banner.faq_description'),
      url: 'https://docs.decentraland.org/player/general/dao/overview/grants-faq/',
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
