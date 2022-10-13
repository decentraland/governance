import React from 'react'

import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

import DotsMenu from '../../Icon/DotsMenu'

import './UpdateMenu.css'

interface Props {
  onDeleteClick: () => void
}

const UpdateMenu = ({ onDeleteClick }: Props) => {
  return (
    <Dropdown className="UpdateMenu" icon={<DotsMenu />} direction="left">
      <Dropdown.Menu>
        <Dropdown.Item text="Delete" onClick={onDeleteClick} />
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default UpdateMenu
