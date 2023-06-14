import React from 'react'

import classNames from 'classnames'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { GrantWithUpdate } from '../../../entities/Proposal/types'
import Username from '../../User/Username'

import './GrantCardHeadline.css'

export type GrantCardHeadlineProps = React.HTMLAttributes<HTMLDivElement> & {
  grant: GrantWithUpdate
  hoverable?: boolean
  expanded?: boolean
}

const GrantCardHeadline = ({ grant, hoverable = false, expanded = false }: GrantCardHeadlineProps) => {
  const { title, user } = grant

  return (
    <div className={classNames('GrantCardHeadline', !expanded && 'GrantCardHeadline__Slim')}>
      <Header
        className={classNames(
          'GrantCardHeadline__Title',
          (!hoverable || !expanded) && 'GrantCardHeadline__TwoLineEllipsis'
        )}
      >
        {title}
      </Header>
      <Username className="GrantCardHeadline__Avatar" address={user} variant="avatar" size="medium" />
    </div>
  )
}

export default GrantCardHeadline
