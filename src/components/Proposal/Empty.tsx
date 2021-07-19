import React from 'react'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Watermelon from '../Icon/Watermelon'
import './Empty.css'

export type EmptyProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  description?: React.ReactNode
  full?: boolean
  border?: boolean
}

export default React.memo(function Empty({ description, border, full, ...props}: EmptyProps) {
  return <div {...props} className={TokenList.join([
    'Empty',
    full && 'full',
    border === false ? 'without-border' : 'with-border',
    props.className
  ])}>
    <Watermelon />
    {typeof description === 'string' && <Paragraph small secondary>{description}</Paragraph>}
    {typeof description !== 'string' && description}
  </div>
})