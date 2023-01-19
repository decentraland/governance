import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { GRANT_PROPOSAL_MAX_BUDGET, GRANT_PROPOSAL_MIN_BUDGET } from '../../entities/Grant/types'

import './DesiredFundingInput.css'
import Label from './Label'

interface Props {
  disabled: boolean
  value: string | number
  onChange: (e: React.FormEvent<HTMLInputElement>) => void
  onBlur: (e: React.FormEvent<HTMLInputElement>) => void
  error: string // TODO: Show errors in the UI
}

const DesiredFundingInput = ({ disabled, value, onChange, onBlur }: Props) => {
  const t = useFormatMessage()

  return (
    <div className="DesiredFundingInput">
      <Label>{t('page.submit_grant.funding_section.desired_funding')}</Label>
      <div>
        <div className="DesiredFundingInput__InputContainer">
          <div className="DesiredFundingInput__Description">USD</div>
          <input
            className="DesiredFundingInput__Input"
            type="number"
            value={value}
            onChange={onChange}
            disabled={disabled}
            onBlur={onBlur}
            min={GRANT_PROPOSAL_MIN_BUDGET}
            max={GRANT_PROPOSAL_MAX_BUDGET}
            placeholder={`${GRANT_PROPOSAL_MIN_BUDGET}-${GRANT_PROPOSAL_MAX_BUDGET}`}
          />
        </div>
      </div>
      <Markdown className="GrantRequestSection__InputSubtitle">
        {t('page.submit_grant.funding_section.desired_funding_sub')}
      </Markdown>
    </div>
  )
}

export default DesiredFundingInput
