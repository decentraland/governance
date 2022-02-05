import React from 'react'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import './DetailItem.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'

export type DetailItemProps =  React.HTMLProps<HTMLDivElement> & {
  name: string,
  value: bigint | string | number
}

export function DetailItem({ name, value, ...props }: DetailItemProps) {
  return <div {...props} className={TokenList.join(['DetailItem', props.className])}>
    <Paragraph small secondary className="DetailItem__Name">{name}</Paragraph>
    <Paragraph small secondary className="DetailItem__Value">{value}</Paragraph>
  </div>
}
