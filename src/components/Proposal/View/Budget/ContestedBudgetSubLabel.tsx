import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './ContestedBudgetSubLabel.css'

type Props = {
  title: string
  amount: number
  legend: string
  percentage?: string
}

export default function ContestedBudgetSubLabel({ title, amount, legend, percentage }: Props) {
  const t = useFormatMessage()

  return (
    <div className="ContestedBudgetSubLabel">
      {legend && <div className={TokenList.join(['ContestedBudgetLabel__Legend', legend])} />}
      <span className="ContestedBudgetSubLabel__Text">{title}</span>
      <span className="ContestedBudgetSubLabel__Text">${t('general.number', { value: amount })}</span>
      {percentage && <span className="ContestedBudgetLabel__Percentage">{`(${percentage})`}</span>}
    </div>
  )
}
