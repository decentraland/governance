import classNames from 'classnames'

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
      <a
        href={url || ''}
        target="_blank"
        className={classNames(!url && 'ProjectsBannerItem--noUrl')}
        rel="noopener noreferrer"
      >
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
      </a>
      {showDivider && <div className="ProjectsBanner__ItemsDivider" />}
    </>
  )
}

export default BannerItem
