import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { GrantWithUpdateAttributes } from '../../../entities/Proposal/types'
import Username from '../../User/Username'

import './GrantCardHeadline.css'

export type GrantCardHeadlineProps = React.HTMLAttributes<HTMLDivElement> & {
  grant: GrantWithUpdateAttributes
  displayUser?: boolean
  expanded?: boolean
}

const GrantCardHeadline = ({ grant, displayUser = false, expanded = false }: GrantCardHeadlineProps) => {
  const { title, user } = grant

  return (
    <div className={TokenList.join(['GrantCardHeadline', displayUser && !expanded && 'GrantCardHeadline__Slim'])}>
      <Header
        className={TokenList.join([
          'GrantCardHeadline__Title',
          displayUser && 'GrantCardHeadline__SlimTitle',
          !expanded && 'GrantCardHeadline__TwoLineEllipsis',
        ])}
      >
        {title}
      </Header>
      {displayUser && <Username className="GrantCardHeadline__Avatar" address={user} iconOnly={true} size={'medium'} />}
    </div>
  )
}

export default GrantCardHeadline
