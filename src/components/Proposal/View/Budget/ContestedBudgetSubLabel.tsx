import classNames from 'classnames'

import useFormatMessage from '../../../../hooks/useFormatMessage'

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
      {legend && (
        <div className={classNames('ContestedBudgetLabel__Legend', `ContestedBudgetCard__Legend--${legend}`)} />
      )}
      <span className="ContestedBudgetSubLabel__Text">{title}</span>
      <span className="ContestedBudgetSubLabel__Text">${t('general.number', { value: amount })}</span>
      {percentage && <span className="ContestedBudgetLabel__Percentage">{`(${percentage})`}</span>}
    </div>
  )
}
