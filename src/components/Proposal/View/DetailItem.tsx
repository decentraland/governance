import classNames from 'classnames'

import Text from '../../Common/Typography/Text'
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
      <Text size="lg" color="secondary" className="DetailItem__Name">
        {name}
      </Text>
      <Text size="lg" color="secondary" className="DetailItem__Value">
        <span>{value}</span>
        {description && (
          <Helper position="left center" text={description} size="20" containerClassName="DetailItemHelper" />
        )}
      </Text>
    </div>
  )
}
