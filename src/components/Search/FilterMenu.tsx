import { useState } from 'react'

import classNames from 'classnames'

import useFormatMessage from '../../hooks/useFormatMessage'
import Text from '../Common/Typography/Text'
import Cross from '../Icon/Cross'
import Filter from '../Icon/Filter'
import Overlay from '../Sidebar/Overlay'

import './FilterMenu.css'

interface Props {
  children: React.ReactNode
}

export default function FilterMenu({ children }: Props) {
  const t = useFormatMessage()
  const [isOpen, setIsOpen] = useState(false)
  const handleClose = () => setIsOpen(false)

  return (
    <div className="FilterMenu">
      <div className="FilterMenu__Button" onClick={() => setIsOpen((prev) => !prev)}>
        <Text color="primary" className="FilterMenu__ButtonText">
          {t('navigation.search.filter')}
        </Text>
        <Filter />
      </div>
      <Overlay isOpen={isOpen} onClick={handleClose} />
      <div className={classNames('FilterMenu__Sidebar', isOpen && 'FilterMenu__Sidebar--open')}>
        <div className="FilterMenu__SidebarContent">
          {children}
          <div className="FilterMenu__CloseButton" onClick={handleClose}>
            <Cross color="var(--black-800)" size={14} />
          </div>
        </div>
      </div>
    </div>
  )
}
