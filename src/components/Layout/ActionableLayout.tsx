import './ActionableLayout.css'

interface Props {
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  children: React.ReactNode
}

export default function ActionableLayout({ rightAction, leftAction, children }: Props) {
  return (
    <div className="ActionableLayout">
      <div className="ActionableLayout__Action">
        <div className="ActionableLayout__Left">{leftAction}</div>
        <div className="ActionableLayout__Right">{rightAction}</div>
      </div>
      <div className="ActionableLayout__Content">{children}</div>
    </div>
  )
}
