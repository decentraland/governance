import { useState } from 'react'

import classNames from 'classnames'
import { NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import Text from '../Common/Typography/Text'

import './CollapsibleFilter.css'

type Props = {
  title: string
  startOpen?: boolean
  children: React.ReactNode
}

export default function CollapsibleFilter({ title, children, startOpen = true }: Props) {
  const [open, setOpen] = useState(startOpen)

  const handleToggleClick = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  return (
    <div className="CollapsibleFilter">
      <div className="FilterHeader" onClick={handleToggleClick}>
        <Text className="FilterHeader__Title" size="sm" weight="semi-bold" color="secondary">
          {title}
        </Text>
        <NotMobile>
          <div className="PlusMinusContainer">
            <div className={classNames('PlusMinus', !open && 'PlusMinus--closed')} />
            <div className="PlusMinus" />
          </div>
        </NotMobile>
      </div>
      <div className={classNames('FilterContent', open && 'FilterContent--open')}>{children}</div>
    </div>
  )
}
