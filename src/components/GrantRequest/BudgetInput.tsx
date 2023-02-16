import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

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
    <div className="BudgetInput__Container">
      <div
        className={TokenList.join(['BudgetInput__InputContainer', showError && 'BudgetInput__InputContainer--Error'])}
      >
        <div className={TokenList.join(['BudgetInput__Description', showError && 'BudgetInput__Description--Error'])}>
          USD
        </div>
        <input className="BudgetInput__Input" type="number" {...props} />
      </div>
      {showError && (
        <div className="BudgetInput__ErrorHelper">
          <Mobile>
            <Helper
              text={t(error)}
              position="bottom center"
              open
              icon={<ExclamationCircle color="red-800" size="16px" />}
            />
          </Mobile>
          <NotMobile>
            <Helper
              text={t(error)}
              position="right center"
              open
              icon={<ExclamationCircle color="red-800" size="16px" />}
            />
          </NotMobile>
        </div>
      )}
    </div>
  )
}

export default BudgetInput
