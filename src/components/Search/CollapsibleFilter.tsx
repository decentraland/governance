import React, { useState, useEffect } from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import './CollapsibleFilter.css'

type CollapsibleFilterProps = {
  title: string,
  startOpen?: boolean,
  children: React.ReactNode,
  onChange?: (open: boolean) => void
}

function CollapsibleFilter({ title, children, startOpen, onChange }: CollapsibleFilterProps) {
  const [open, setOpen] = useState(!!startOpen)

  useEffect(() => {
    onChange && onChange(open)
  }, [])

  const toggleHandler = () => {
    setOpen(!open)
    onChange && onChange(!open)
  }

  return <div className={'CollapsibleFilter'}>
    <div className={'FilterHeader'} onClick={toggleHandler}>
      <Header sub className={'FilterHeader__Title'}>{title}</Header>
      <div className="PlusMinusContainer">
        <div className="PlusMinus" style={{ transform: `${open ? 'rotate(0)' : 'rotate(90deg)'}` }} />
        <div className="PlusMinus" />
      </div>
    </div>
    <div className={TokenList.join(['FilterContent', open && 'FilterContent--open'])} >
      {children}
    </div>
  </div>
}

export default React.memo(CollapsibleFilter)
