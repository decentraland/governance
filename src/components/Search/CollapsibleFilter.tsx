import { useEffect, useState } from 'react'

import classNames from 'classnames'

import Text from '../Common/Typography/Text'

import './CollapsibleFilter.css'

type Props = {
  title: string
  startOpen?: boolean
  children: React.ReactNode
  onChange?: (open: boolean) => void
}

function CollapsibleFilter({ title, children, startOpen, onChange }: Props) {
  const [open, setOpen] = useState(!!startOpen)

  useEffect(() => {
    onChange && onChange(open)
  }, [onChange, open])

  const toggleHandler = () => {
    setOpen(!open)
    onChange && onChange(!open)
  }

  return (
    <div className="CollapsibleFilter">
      <div className="FilterHeader" onClick={toggleHandler}>
        <Text className="FilterHeader__Title" size="sm" weight="semi-bold" color="secondary">
          {title}
        </Text>
        <div className="PlusMinusContainer">
          <div className={classNames('PlusMinus', !open && 'PlusMinus--closed')} />
          <div className="PlusMinus" />
        </div>
      </div>
      <div className={classNames('FilterContent', open && 'FilterContent--open')}>{children}</div>
    </div>
  )
}

export default CollapsibleFilter
