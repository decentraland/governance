import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { GRANT_PROPOSAL_MAX_BUDGET, GRANT_PROPOSAL_MIN_BUDGET } from '../../entities/Grant/types'
import Label from '../Common/Label'

import BudgetInput from './BudgetInput'
import './DesiredFundingInput.css'

interface Props {
  disabled: boolean
  value: string | number
  onChange: (e: React.FormEvent<HTMLInputElement>) => void
  onBlur: (e: React.FormEvent<HTMLInputElement>) => void
  error: string
}

const DesiredFundingInput = ({ disabled, value, onChange, onBlur, error }: Props) => {
  const t = useFormatMessage()

  return (
    <div className="DesiredFundingInput">
      <Label>{t('page.submit_grant.funding_section.desired_funding')}</Label>
      <div className="DesiredFundingInput__InputContainer">
        <BudgetInput
          min={GRANT_PROPOSAL_MIN_BUDGET}
          max={GRANT_PROPOSAL_MAX_BUDGET}
          placeholder={`${GRANT_PROPOSAL_MIN_BUDGET}-${GRANT_PROPOSAL_MAX_BUDGET}`}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
        />
      </div>
      <Markdown className="GrantRequestSection__InputSubtitle">
        {t('page.submit_grant.funding_section.desired_funding_sub')}
      </Markdown>
    </div>
  )
}

export default DesiredFundingInput
