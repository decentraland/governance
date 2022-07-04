import React from 'react'

import './BannerItem.css'

interface Props {
  title: string
  description: string
}

const BannerItem = ({ title, description }: Props) => {
  return (
    <div className="GrantsBannerItem">
      <div>
        <h3 className="GrantsBannerItem__Title">{title}</h3>
        <p className="GrantsBannerItem__Description">{description}</p>
      </div>
    </div>
  )
}

export default BannerItem
