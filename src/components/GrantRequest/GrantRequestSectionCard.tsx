import React from 'react'
import Skeleton from 'react-loading-skeleton'

import './GrantRequestSectionCard.css'

export const GrantRequestSectionCard = ({
  subtitle,
  category,
  helper,
  title,
  titleExtra,
  subtitleVariant = 'normal',
}: {
  category: string
  title: string | null
  titleExtra?: string
  subtitle: string
  helper: React.ReactNode
  subtitleVariant?: 'normal' | 'uppercase'
}) => {
  return (
    <div className="GrantRequestSectionCard">
      <div className="GrantRequestSectionCard__Header">
        <div className="GrantRequestSectionCard__HeaderTitle">{category}</div>
        {helper}
      </div>
      <div className="GrantRequestSectionCard__ContentTitle GrantRequestSectionCard__AlignBaseline">
        {title || <Skeleton className="GrantRequestSectionCard__Empty" enableAnimation={false} />}
        {titleExtra && <span className="GrantRequestSectionCard__TitleExtra">{titleExtra}</span>}
      </div>
      <div
        className={
          subtitleVariant === 'normal' ? 'GrantRequestSectionCard__SubTitle' : 'GrantRequestSectionCard__CapsSubTitle'
        }
      >
        {subtitle}
      </div>
    </div>
  )
}
