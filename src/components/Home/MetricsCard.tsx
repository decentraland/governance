import classNames from 'classnames'
import { Card } from 'decentraland-ui/dist/components/Card/Card'

import Link from '../Common/Typography/Link'

import HomeLoader from './HomeLoader'
import './MetricsCard.css'

interface Props {
  href?: string
  isLoading?: boolean
  category: string
  title: string
  description?: string
  loadingLabel?: string
  fullWidth?: boolean
  variant?: 'light' | 'dark'
}

export default function MetricsCard({
  href,
  category,
  title,
  description,
  isLoading,
  loadingLabel,
  variant = 'light',
  fullWidth = false,
}: Props) {
  return (
    <Card
      as={href ? Link : undefined}
      href={href}
      className={classNames(
        'MetricsCard',
        variant && `MetricsCard--${variant}`,
        !href && `MetricsCard--static`,
        fullWidth && `MetricsCard--full-width`
      )}
    >
      {!isLoading && (
        <div className="MetricsCard__Container">
          <p className={classNames('MetricsCard__Category', variant && `MetricsCard__Category--${variant}`)}>
            {category}
          </p>
          <h2 className={classNames('MetricsCard__Title', variant && `MetricsCard__Title--${variant}`)}>{title}</h2>
          <p className={classNames('MetricsCard__Description', variant && `MetricsCard__Description--${variant}`)}>
            {description}
          </p>
        </div>
      )}
      {isLoading && loadingLabel && (
        <div className="MetricsCard__Container">
          <HomeLoader size="small">{loadingLabel}</HomeLoader>
        </div>
      )}
    </Card>
  )
}
