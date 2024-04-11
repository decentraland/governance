import React from 'react'

import CheckboxField from '../GrantRequest/CheckboxField'

import './ActivityTickerFilterItem.css'

interface Props {
  onClick: () => void
  checked: boolean
  label: string
}

export default function ActivityTickerFilterItem({ onClick, checked, label }: Props) {
  return (
    <div className={'ActivityTickerFilterItem'} onClick={onClick}>
      <CheckboxField
        onClick={() => {}}
        checked={checked}
        disabled={false}
        checkboxClass="ActivityTickerFilterItem__Checkbox"
        checkboxLabelClass="ActivityTickerFilterItem__CheckboxLabel"
        checkboxLabelCheckedClass="ActivityTickerFilterItem__CheckboxLabelChecked"
      >
        {label}
      </CheckboxField>
    </div>
  )
}
