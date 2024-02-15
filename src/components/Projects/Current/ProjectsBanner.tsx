import { useMemo, useState } from 'react'

import classNames from 'classnames'

import { HIDE_PROJECTS_BANNER_KEY } from '../../../front/localStorageKeys'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Text from '../../Common/Typography/Text'
import Info from '../../Icon/Info'
import LayoutTop from '../../Icon/LayoutTop'
import Minus from '../../Icon/Minus'
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
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(HIDE_PROJECTS_BANNER_KEY) === 'true')

  const handleCollapseClick = () => {
    const isProjectsBannerVisible = localStorage.getItem(HIDE_PROJECTS_BANNER_KEY) !== 'true'
    const nextLocalStorageValue = isProjectsBannerVisible ? 'true' : 'false'
    localStorage.setItem(HIDE_PROJECTS_BANNER_KEY, nextLocalStorageValue)
    setCollapsed(isProjectsBannerVisible)
  }

  if (collapsed) {
    return (
      <div className="ProjectsBanner__Collapsed">
        <div className="ProjectsBanner__CollapsedInfo">
          <Info size="16" color="var(--black-600)" />
          <Text className="ProjectsBanner__CollapsedInfoText">
            Find General Information about our Projects and their funding in here
          </Text>
        </div>
        <button
          onClick={handleCollapseClick}
          className={'ProjectsBanner__CollapseButton'}
          aria-label={t('page.grants.banner.collapse_button_show_label')}
        >
          <LayoutTop />
        </button>
      </div>
    )
  }

  return (
    <div className={classNames('ProjectsBanner', `ProjectsBanner--current`)}>
      <div className="ProjectsBanner__Background" />
      <div className="ProjectsBannerItem__Text">
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
      <button
        onClick={handleCollapseClick}
        className={classNames('ProjectsBanner__CollapseButton', 'ProjectsBanner__CollapseButton--hide')}
        aria-label={t('page.grants.banner.collapse_button_hide_label')}
      >
        <Minus />
      </button>
    </div>
  )
}
