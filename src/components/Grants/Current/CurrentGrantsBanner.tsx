import React, { useMemo } from 'react'

import classNames from 'classnames'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import BannerItem from '../BannerItem'

import './CurrentGrantsBanner.css'

type BannerItem = {
  title: string
  description: string
  url?: string
}

export default function CurrentGrantsBanner() {
  const t = useFormatMessage()
  const items: BannerItem[] = useMemo(
    () => [
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
    ],
    [t]
  )

  const title = t('page.grants.current_banner.title')
  const description = t('page.grants.current_banner.description')

  return (
    <div className={classNames('GrantsBanner', `GrantsBanner--current`)}>
      <div className="GrantsBannerItem_Text">
        <h2 className="GrantsBanner__Title">{title}</h2>
        <p className="GrantsBanner__Description">{description}</p>
      </div>
      <div className="GrantsBanner__Items">
        {items.map((item, index) => (
          <BannerItem
            key={item.title}
            title={item.title}
            description={item.description}
            url={item.url}
            showDivider={index !== items.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
