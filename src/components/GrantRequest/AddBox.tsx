import React from 'react'

import AddPrimary from '../Icon/AddPrimary'

import './AddBox.css'

interface Props {
  children: React.ReactText
  onClick: () => void
}

const AddBox = ({ children, onClick }: Props) => {
  return (
    <button className="AddBox" onClick={onClick}>
      <AddPrimary className="AddBox__Icon" />
      <span>{children}</span>
    </button>
  )
}

export default AddBox
