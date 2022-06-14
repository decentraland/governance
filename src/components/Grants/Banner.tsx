import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './Banner.css'
import BannerItem from './BannerItem'

export enum BannerType {
  Current = 'current',
  Past = 'past',
}

interface Props {
  title: string
  description: string
  type: BannerType
  items: { title: string; description: string }[]
}

const Banner = ({ title, description, items, type }: Props) => {
  return (
    <div className={TokenList.join(['GrantsBanner', `GrantsBanner--${type}`])}>
      <div>
        <h2 className="GrantsBanner__Title">{title}</h2>
        <p className="GrantsBanner__Description">{description}</p>
      </div>
      <div className="GrantsBanner__Items">
        {items.map((item, index) => (
          <>
            <BannerItem title={item.title} description={item.description} />
            {index !== items.length - 1 && <div className="GrantsBanner__ItemsDivider" />}
          </>
        ))}
      </div>
    </div>
  )
}

export default Banner
