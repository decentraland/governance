import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import Lock from '../Icon/Lock'

import './ActionCard.css'

export interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: () => void
  action_title?: string
  onCardClick?: () => void
  isDisabled?: boolean
}

function ActionCard({
  icon,
  title,
  description,
  action,
  action_title,
  onCardClick,
  isDisabled = false,
}: ActionCardProps) {
  const t = useFormatMessage()
  const isImplemented = !!action || !!onCardClick
  return (
    <Card
      className={TokenList.join(['ActionCard', (!isImplemented || isDisabled) && 'ActionCard--disabled'])}
      onClick={onCardClick}
    >
      <Grid>
        <Grid.Row>
          <Grid.Column width={3}>{icon}</Grid.Column>
          <Grid.Column width={13}>
            <div>
              <h3>
                {title}
                {!isImplemented && <span className="ActionCard__SoonLabel">{t('modal.identity_setup.soon')}</span>}
              </h3>
              <p>{description}</p>
            </div>
            <div className="ActionCard__Action">
              {action &&
                action_title &&
                (isDisabled ? (
                  <Lock />
                ) : (
                  <Button basic onClick={action}>
                    {action_title}
                  </Button>
                ))}
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Card>
  )
}

export default ActionCard
