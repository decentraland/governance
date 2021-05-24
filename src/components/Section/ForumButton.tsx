import React from 'react'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './DetailsSection.css'
import './SectionButton.css'

const forumIcon = require('../../images/icons/forum.svg')
const openIcon = require('../../images/icons/open.svg')

export type ForumButtonProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  loading?: boolean,
  disabled?: boolean,
}

export default React.memo(function ForumButton({ loading, disabled, ...props }: ForumButtonProps) {
  const l = useFormatMessage()
  return <a {...props} target="_black"  className={TokenList.join([
    'DetailsSection',
    'SectionButton',
    'ForumButton',
    loading && 'SectionButton--loading',
    disabled && 'SectionButton--disabled',
    props.className
  ])}>
    <Loader active={loading} size="small" />
    <img src={forumIcon} width="20" height="20"/>
    <span>{l('page.proposal_detail.forum_button')}</span>
    <img src={openIcon} width="12" height="12"/>
  </a>
})