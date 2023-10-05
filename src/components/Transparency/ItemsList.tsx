import './ItemsList.css'

interface Props {
  children: React.ReactNode
}

export default function ItemsList({ children }: Props) {
  return <div className="ItemsList">{children}</div>
}
