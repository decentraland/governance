import classNames from 'classnames'

import './PercentageLabel.css'

export type Props = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  percentage: number
  color: 'Yellow' | 'Green' | 'Red' | 'Fuchsia'
}

const PercentageLabel = ({ percentage, color }: Props) => {
  return <span className={classNames(`PercentageLabel`, `PercentageLabel--${color}`)}>{percentage}%</span>
}

export default PercentageLabel
