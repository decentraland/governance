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
  const Component = url ? Link : 'button'

  return (
    <Component href={url} onClick={onClick} className="Action">
      <div className="Action__Icon">{icon}</div>
      <div className="Action__Information">
        <div className="Action__Title">{title}</div>
        <div className="Action__Description">{description}</div>
      </div>
    </Component>
  )
}

export default Action
