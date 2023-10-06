import './BudgetBannerItem.css'

interface Props {
  value: string
  label: string
}

function BudgetBannerItem({ value, label }: Props) {
  return (
    <div className="BudgetBannerItem">
      <div className="BudgetBannerItem__Value">{value}</div>
      <div className="BudgetBannerItem__Label">{label}</div>
    </div>
  )
}

export default BudgetBannerItem
