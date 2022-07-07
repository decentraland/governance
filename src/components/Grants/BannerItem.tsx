import React from 'react'

import './BannerItem.css'

interface Props {
  title: string
  description: string
  showDivider: boolean
}

const BannerItem = ({ title, description, showDivider }: Props) => {
  return (
    <>
      <div className="GrantsBannerItem">
        <div>
          <h3 className="GrantsBannerItem__Title">{title}</h3>
          <p className="GrantsBannerItem__Description">{description}</p>
        </div>
      </div>
      {showDivider && <div className="GrantsBanner__ItemsDivider" />}
    </>
  )
}

export default BannerItem
