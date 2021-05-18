import React from 'react'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import './Empty.css'

export type EmptyProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  description?: React.ReactNode
}

export default React.memo(function Empty({ description, ...props}: EmptyProps) {
  return <div {...props} className={TokenList.join(['Empty', props.className])}>
    {typeof description === 'string' && <Paragraph small semiBold secondary>{description}</Paragraph>}
    {typeof description !== 'string' && description}
  </div>
})