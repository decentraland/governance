import classNames from 'classnames'

import Link from '../Common/Typography/Link'
import ChevronRight from '../Icon/ChevronRight'

import './BannerItem.css'

interface Props {
  title: string
  description: string
  url?: string
  showDivider: boolean
}

const BannerItem = ({ title, description, url, showDivider }: Props) => {
  return (
    <>
      <Link href={url || ''} className={classNames(!url && 'ProjectsBannerItem--noUrl')}>
        <div className="ProjectsBannerItem">
          <div>
            <h3 className="ProjectsBannerItem__Title">{title}</h3>
            <p className="ProjectsBannerItem__Description">{description}</p>
          </div>
          {url && (
            <div>
              <ChevronRight />
            </div>
          )}
        </div>
      </Link>
      {showDivider && <div className="ProjectsBanner__ItemsDivider" />}
    </>
  )
}

export default BannerItem
