import classNames from 'classnames'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import useFormatMessage from '../../hooks/useFormatMessage'

import './ActionCard.css'

export interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  onCardClick?: () => void
  isDisabled?: boolean
  isVerified?: boolean
  isNew?: boolean
  helper?: string
}

function ActionCard({
  icon,
  title,
  description,
  action,
  onCardClick,
  isVerified,
  isDisabled = false,
  isNew,
  helper,
}: ActionCardProps) {
  const t = useFormatMessage()
  const isActionable = !isDisabled && !isVerified

  return (
    <Card
      className={classNames('ActionCard', !isActionable && 'ActionCard--disabled')}
      onClick={isActionable ? onCardClick : undefined}
    >
      <Grid>
        <Grid.Row>
          <Grid.Column width={3}>{icon}</Grid.Column>
          <Grid.Column width={13}>
            <div>
              <h3>
                {title}
                {isVerified && (
                  <span className="ActionCard__Label ActionCard__VerifiedLabel">
                    {t('modal.identity_setup.verified')}
                  </span>
                )}
                {isNew && !isVerified && (
                  <span className="ActionCard__Label ActionCard__IsNewLabel">{t('category.new')}</span>
                )}
              </h3>
              <p>{description}</p>
              {!!helper && <p className="ActionCard__Helper">{helper}</p>}
            </div>
            {!!action && <div className="ActionCard__Action">{action}</div>}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Card>
  )
}

export default ActionCard
