import React, { useCallback } from 'react'

import Label from '../Common/Typography/Label'
import Markdown from '../Common/Typography/Markdown'
import Add from '../Icon/Add'
import Remove from '../Icon/Remove'

import './NumberSelector.css'

interface Props {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  label: string
  unitLabel: string
  subtitle?: string
}

const NumberSelector = ({ value, onChange, min, max, label, unitLabel, subtitle }: Props) => {
  const handleAddClick = useCallback(() => {
    if (value === max) {
      return
    }

    onChange(value + 1)
  }, [onChange, max, value])

  const handleRemoveClick = useCallback(() => {
    if (value === min) {
      return
    }

    onChange(value - 1)
  }, [onChange, min, value])

  return (
    <div className="NumberSelector">
      <Label>{label}</Label>
      <div>
        <div className="NumberSelector__InputContainer">
          <div className="NumberSelector__Input">
            <button className="NumberSelector__Button" onClick={handleRemoveClick}>
              <Remove />
            </button>
            <span className="NumberSelector__Value">{value}</span>
            <button className="NumberSelector__Button" onClick={handleAddClick}>
              <Add />
            </button>
          </div>
          <div className="NumberSelector__Description">{unitLabel}</div>
        </div>
      </div>
      {subtitle && (
        <Markdown size="sm" componentsClassNames={{ p: 'NumberSelector__Subtitle' }}>
          {subtitle}
        </Markdown>
      )}
    </div>
  )
}

export default NumberSelector
