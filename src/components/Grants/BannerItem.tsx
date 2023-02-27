import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import ChevronRight from '../Icon/ChevronRight'

import './BannerItem.css'

interface Props {
  title: string
  description: string
  url?: string
  showDivider: boolean
}

const BannerItem = ({ title, description, url, showDivider }: Props) => {
  return (
    <>
      <a
        href={url || ''}
        target="_blank"
        className={TokenList.join([!url && 'GrantsBannerItem--noUrl'])}
        rel="noopener noreferrer"
      >
        <div className="GrantsBannerItem">
          <div>
            <h3 className="GrantsBannerItem__Title">{title}</h3>
            <p className="GrantsBannerItem__Description">{description}</p>
          </div>
          {url && (
            <div>
              <ChevronRight />
            </div>
          )}
        </div>
      </a>
      {showDivider && <div className="GrantsBanner__ItemsDivider" />}
    </>
  )
}

export default BannerItem
