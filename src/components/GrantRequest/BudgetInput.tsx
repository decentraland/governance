import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

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
      <div className="BudgetInput__Wrapper">
        <Helper
          text={t(error)}
          position="bottom center"
          open={!!showError}
          icon={
            <div className="BudgetInput__Container">
              <div
                className={TokenList.join([
                  'BudgetInput__InputContainer',
                  showError && 'BudgetInput__InputContainer--Error',
                ])}
              >
                <div
                  className={TokenList.join([
                    'BudgetInput__Description',
                    showError && 'BudgetInput__Description--Error',
                  ])}
                >
                  USD
                </div>
                <input
                  className={TokenList.join(['BudgetInput__Input', showError && 'BudgetInput__Input--error'])}
                  type="number"
                  {...props}
                />
                {showError && <ExclamationCircle className="BudgetInput__ErrorHelper" color="red-800" size="16px" />}
              </div>
            </div>
          }
        />
      </div>
      <Markdown className="BudgetInput__Subtitle">{subtitle}</Markdown>
    </div>
  )
}

export default BudgetInput
