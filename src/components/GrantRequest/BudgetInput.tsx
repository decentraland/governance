import React from 'react'

import classNames from 'classnames'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { disableOnWheelInput } from '../../helpers'
import Label from '../Common/Label'
import Helper from '../Helper/Helper'
import ExclamationCircle from '../Icon/ExclamationCircle'

import './BudgetInput.css'

interface Props {
  error?: string
  label: string
  subtitle: string
}

const BudgetInput = ({ error, label, subtitle, ...props }: Props & React.HTMLProps<HTMLInputElement>) => {
  const t = useFormatMessage()
  const showError = error && error.length > 0

  return (
    <div className="BudgetInput">
      <Label>{label}</Label>
      <div className="BudgetInput__Container">
        <Helper
          text={t(error)}
          position="bottom center"
          open={!!showError}
          icon={
            <div
              className={classNames('BudgetInput__InputContainer', showError && 'BudgetInput__InputContainer--error')}
            >
              <div className={classNames('BudgetInput__Description', showError && 'BudgetInput__Description--error')}>
                USD
              </div>
              <input
                className={classNames('BudgetInput__Input', showError && 'BudgetInput__Input--error')}
                type="number"
                onWheel={disableOnWheelInput}
                {...props}
              />
              {showError && <ExclamationCircle className="BudgetInput__ErrorHelper" color="red-800" size="16px" />}
            </div>
          }
        />
      </div>
      <Markdown className="BudgetInput__Subtitle">{subtitle}</Markdown>
    </div>
  )
}

export default BudgetInput
