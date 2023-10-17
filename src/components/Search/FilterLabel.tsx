import classNames from 'classnames'

import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'

import './FilterLabel.css'

interface Props {
  active?: boolean
  label: string
  href: string
}

export default function FilterLabel({ active, label, href }: Props) {
  return (
    <Link href={href} className={classNames('FilterLabel', active && 'FilterLabel--active')}>
      <span>
        <Text weight={active ? 'medium' : 'normal'} className="FilterLabel__Text">
          {label}
        </Text>
      </span>
    </Link>
  )
}
