import React from 'react'

import AddPrimary from '../Icon/AddPrimary'

import './AddBox.css'

interface Props {
  children: React.ReactText
  onClick: () => void
  disabled?: boolean
}

const AddBox = ({ children, onClick, disabled }: Props) => {
  return (
    <button disabled={disabled} className="AddBox" onClick={onClick}>
      <AddPrimary className="AddBox__Icon" />
      <span>{children}</span>
    </button>
  )
}

export default AddBox
