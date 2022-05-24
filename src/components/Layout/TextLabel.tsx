import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './TextLabel.css'

export type TextLabelProps = React.HTMLAttributes<HTMLDivElement> & {
  text: string | null
}

export default React.memo(function TextLabel({ text, ...props }: TextLabelProps) {
  return (
    <div {...props} className={TokenList.join(['TextLabel', props.className])}>
      <span>{text}</span>
    </div>
  )
})
