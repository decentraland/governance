import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import Helper from '../Helper/Helper'
import ExclamationCircle from '../Icon/ExclamationCircle'

import './BudgetInput.css'

interface Props {
  error?: string
}

const BudgetInput = ({ error, ...props }: Props & React.HTMLProps<HTMLInputElement>) => {
  const t = useFormatMessage()
  const showError = error && error.length > 0

  return (
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
              className={TokenList.join(['BudgetInput__Description', showError && 'BudgetInput__Description--Error'])}
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
  )
}

export default BudgetInput
