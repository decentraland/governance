import React from 'react'

import AddPrimary from '../Icon/AddPrimary'

import './AddBox.css'

interface Props {
  children: React.ReactText
}

const AddBox = ({ children }: Props) => {
  return (
    <button className="AddBox">
      <AddPrimary className="AddBox__Icon" />
      <span>{children}</span>
    </button>
  )
}

export default AddBox
