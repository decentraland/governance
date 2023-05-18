import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import './ActionCard.css'

export interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  onCardClick?: () => void
  isDisabled?: boolean
  helper?: string
}

function ActionCard({ icon, title, description, action, onCardClick, isDisabled = false, helper }: ActionCardProps) {
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
