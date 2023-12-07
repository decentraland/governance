import { useCallback, useEffect } from 'react'

import classNames from 'classnames'
import { UnitTypeLongPlural } from 'dayjs'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

import useFormatMessage from '../../hooks/useFormatMessage'
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
  unit: UnitTypeLongPlural | UnitTypeLongPlural[]
  subtitle?: string
  onUnitChange?: (unit: UnitTypeLongPlural) => void
  disabled?: boolean
  className?: string
}

const NumberSelector = ({
  value,
  onChange,
  min,
  max,
  label,
  unit,
  onUnitChange,
  subtitle,
  disabled,
  className,
}: Props) => {
  const t = useFormatMessage()
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

  const handleUnitChange = useCallback(
    (unit: UnitTypeLongPlural) => {
      if (onUnitChange) {
        onUnitChange(unit)
      }
    },
    [onUnitChange]
  )
  const isUnitArray = Array.isArray(unit)

  useEffect(() => {
    if (isUnitArray && unit.length > 0) {
      handleUnitChange(unit[0])
    }
  }, [handleUnitChange, isUnitArray, unit])

  const getUnitLabel = (unit: UnitTypeLongPlural) => t(`general.time_units.${unit}`)
  const getUnitOptions = (units: UnitTypeLongPlural[]) =>
    units.map((unit) => ({ key: unit, value: unit, text: getUnitLabel(unit) }))

  return (
    <div className={classNames('NumberSelector', className)}>
      <Label>{label}</Label>
      <div className="NumberSelector__Container">
        <div className="NumberSelector__InputContainer">
          <div className="NumberSelector__Input">
            <button className="NumberSelector__Button" onClick={handleRemoveClick} disabled={disabled}>
              <Remove />
            </button>
            <span className="NumberSelector__Value">{value}</span>
            <button className="NumberSelector__Button" onClick={handleAddClick} disabled={disabled}>
              <Add />
            </button>
          </div>
          {!isUnitArray ? (
            <div className="NumberSelector__Description">{getUnitLabel(unit)}</div>
          ) : (
            <Dropdown
              className="NumberSelector__Dropdown"
              selection
              disabled={disabled}
              defaultValue={unit[0]}
              options={getUnitOptions(unit)}
              onChange={(_, { value }) => handleUnitChange(value as UnitTypeLongPlural)}
            />
          )}
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
