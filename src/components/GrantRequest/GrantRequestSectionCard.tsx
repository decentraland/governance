import React from 'react'
import Skeleton from 'react-loading-skeleton'

import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import ExclamationCircle from '../Icon/ExclamationCircle'

import './GrantRequestSectionCard.css'

interface Props {
  title: string | React.ReactNode
  content: string | React.ReactNode | null
  titleExtra?: string
  subtitle: string | React.ReactNode
  helper?: React.ReactNode
  subtitleVariant?: 'normal' | 'uppercase'
  error?: boolean
  href?: string
}
export const GrantRequestSectionCard = ({
  subtitle,
  title,
  helper,
  content,
  titleExtra,
  subtitleVariant = 'normal',
  error,
  href,
}: Props) => {
  return (
    <a
      className={TokenList.join([
        'GrantRequestSectionCard',
        error && 'GrantRequestSectionCard__Error',
        href && 'GrantRequestSectionCard__Hoverable',
      ])}
      href={href}
      onClick={(e) => {
        if (href) {
          e.preventDefault()
          navigate(href)
        }
      }}
    >
      <div className="GrantRequestSectionCard__Header">
        <div className="GrantRequestSectionCard__HeaderTitle">
          {title}
          {error && <ExclamationCircle color={'red-800'} size={'13px'} />}
        </div>

        {helper}
      </div>
      <div className="GrantRequestSectionCard__ContentTitle GrantRequestSectionCard__AlignBaseline">
        {content || <Skeleton className="GrantRequestSectionCard__Empty" enableAnimation={false} />}
        {titleExtra && <span className="GrantRequestSectionCard__TitleExtra">{titleExtra}</span>}
      </div>
      <div
        className={
          subtitleVariant === 'normal' ? 'GrantRequestSectionCard__SubTitle' : 'GrantRequestSectionCard__CapsSubTitle'
        }
      >
        {subtitle}
      </div>
    </a>
  )
}
