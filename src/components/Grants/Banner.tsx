import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './Banner.css'
import BannerItem from './BannerItem'

export enum BannerType {
  Current = 'current',
  Past = 'past',
}

export type BannerItem = {
  title: string
  description: string
  url?: string
}

interface Props {
  title: string
  description: string
  type: BannerType
  items: BannerItem[]
}

const Banner = ({ title, description, items, type }: Props) => {
  return (
    <div className={TokenList.join(['GrantsBanner', `GrantsBanner--${type}`])}>
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

export default Banner
