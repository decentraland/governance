import './Stat.css'

interface Props {
  title: string
  description: string
}

function Stat({ title, description }: Props) {
  return (
    <div className="Stat">
      <div className="Stat__Title">{title}</div>
      <div className="Stat__Description">{description}</div>
    </div>
  )
}

export default Stat
