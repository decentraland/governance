import React from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import Sort from '../Icon/Sort'

import './ButtonWithArrow.css'

interface Props {
  label: string
  arrowDirection: 'up' | 'down'
  onClick: () => void
}

export default function ButtonWithArrow({ label, arrowDirection, onClick }: Props) {
  return (
    <Button basic className="ButtonWithArrow" onClick={onClick}>
      <span className="ButtonWithArrow__Label">{label}</span>
      <Sort descending={arrowDirection === 'down'} selectedColor="primary" />
    </Button>
  )
}
