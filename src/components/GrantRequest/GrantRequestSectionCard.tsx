import React from 'react'
import Skeleton from 'react-loading-skeleton'

import { Link } from '@reach/router'
import classNames from 'classnames'

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
    <Link
      className={classNames(
        'GrantRequestSectionCard',
        error && 'GrantRequestSectionCard__Error',
        href && 'GrantRequestSectionCard__Hoverable'
      )}
      to={href || ''}
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
    </Link>
  )
}
