import React, { useMemo } from 'react'

import classNames from 'classnames'

import useFormatMessage from '../../../hooks/useFormatMessage'
import BannerItem from '../BannerItem'

import './ProjectsBanner.css'

type BannerItem = {
  title: string
  description: string
  url?: string
}

export default function ProjectsBanner() {
  const t = useFormatMessage()
  const title = t('page.grants.banner.title')
  const description = t('page.grants.banner.description')
  const items: BannerItem[] = useMemo(
    () => [
      {
        title: t('page.grants.banner.budget_title'),
        description: t('page.grants.banner.budget_description'),
        url: 'https://governance.decentraland.org/proposal/?id=bfab7b70-7b75-11ed-ad27-015f26e7c35c',
      },
      {
        title: t('page.grants.banner.transparency_title'),
        description: t('page.grants.banner.transparency_description'),
        url: 'https://docs.google.com/spreadsheets/d/1FoV7TdMTVnqVOZoV4bvVdHWkeu4sMH5JEhp8L0Shjlo/edit#gid=1087165366',
      },
      {
        title: t('page.grants.banner.faq_title'),
        description: t('page.grants.banner.faq_description'),
        url: 'https://docs.decentraland.org/player/general/dao/overview/grants-faq/',
      },
    ],
    [t]
  )

  return (
    <div className={classNames('ProjectsBanner', `ProjectsBanner--current`)}>
      <div className="ProjectsBannerItem_Text">
        <h2 className="ProjectsBanner__Title">{title}</h2>
        <p className="ProjectsBanner__Description">{description}</p>
      </div>
      <div className="ProjectsBanner__Items">
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
