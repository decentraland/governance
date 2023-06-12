import React from 'react'

import classNames from 'classnames'

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
        className={classNames(!url && 'GrantsBannerItem--noUrl')}
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
