import React from 'react'

import classNames from 'classnames'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'

import Helper from '../../Helper/Helper'

import './DetailItem.css'

export type DetailItemProps = React.HTMLProps<HTMLDivElement> & {
  name: string
  value: bigint | string | number
  description?: string
}

export function DetailItem({ name, value, description, ...props }: DetailItemProps) {
  return (
    <div {...props} className={classNames('DetailItem', props.className)}>
      <Paragraph small secondary className="DetailItem__Name">
        {name}
      </Paragraph>
      <Paragraph small secondary className="DetailItem__Value">
        <span>{value}</span>
        {description && (
          <Helper position="left center" text={description} size="20" containerClassName="DetailItemHelper" />
        )}
      </Paragraph>
    </div>
  )
}
