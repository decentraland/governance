import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import Divider from '../../Common/Divider'
import NewBadge from '../NewBadge/NewBadge'

import './Section.css'

interface Props {
  title: string
  children: React.ReactNode
  isNew?: boolean
  isLoading?: boolean
  action?: React.ReactNode
}

export default function Section({ title, children, isNew, isLoading, action }: Props) {
  return (
    <div>
      <Divider />
      <div className="Section__Container">
        <div className="Section__Header">
          <div className="Section__TitleContainer">
            <h3 className="Section__Title">{title}</h3>
            {isNew && (
              <span>
                <NewBadge />
              </span>
            )}
          </div>
          <div className="Section__Action">{action}</div>
        </div>
        {isLoading ? (
          <div className="Section__LoadingContainer">
            <Loader active />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
