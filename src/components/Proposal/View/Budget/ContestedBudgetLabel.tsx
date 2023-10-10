import classNames from 'classnames'

import useFormatMessage from '../../../../hooks/useFormatMessage'

import './ContestedBudgetLabel.css'

type Props = {
  title: string
  amount: number
  legend: string
  percentage?: string
}

export default function ContestedBudgetLabel({ title, amount, legend, percentage }: Props) {
  const t = useFormatMessage()

  return (
    <div className="ContestedBudgetLabel">
      <span className="ContestedBudgetLabel__Title">{title}</span>
      <div className="ContestedBudgetLabel__Content">
        <div className={classNames('ContestedBudgetLabel__Legend', `ContestedBudgetCard__Legend--${legend}`)} />
        <span className="ContestedBudgetLabel__Amount">${t('general.number', { value: amount })}</span>
        {percentage && <span className="ContestedBudgetLabel__Percentage">{`(${percentage})`}</span>}
      </div>
    </div>
  )
}
