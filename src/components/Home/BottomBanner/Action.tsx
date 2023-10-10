import Link from '../../Common/Typography/Link'

import './Action.css'

export interface ActionProps {
  icon: JSX.Element
  title: string
  description: string
  url?: string
  onClick?: () => void
}

function Action({ icon, title, description, url, onClick }: ActionProps) {
  return (
    <Link href={url} onClick={onClick} target="_blank" rel="noreferrer" className="Action">
      <div className="Action__Icon">{icon}</div>
      <div>
        <div className="Action__Title">{title}</div>
        <div className="Action__Description">{description}</div>
      </div>
    </Link>
  )
}

export default Action
