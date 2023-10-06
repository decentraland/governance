import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'

import './BreakdownItem.css'

interface Props {
  title: string
  subtitle: string
  extra?: string
  onClick: () => void
}

function BreakdownItem({ title, subtitle, extra, onClick }: Props) {
  return (
    <div role="button" className="BreakdownItem" onClick={onClick}>
      <div>
        <h3 className="BreakdownItem__Title">{title}</h3>
        <span className="BreakdownItem__Subtitle">{subtitle}</span>
      </div>
      <div className="BreakdownItem__Container">
        {extra && <span className="BreakdownItem__Extra">{extra}</span>}
        <ChevronRightCircleOutline />
      </div>
    </div>
  )
}

export default BreakdownItem
