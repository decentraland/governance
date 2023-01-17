import React from 'react'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { GRANT_PROPOSAL_MAX_BUDGET, GRANT_PROPOSAL_MIN_BUDGET } from '../../entities/Grant/constants'

import './GrantRequestDesiredFunding.css'

interface Props {
  disabled: boolean
  value: string | number
  onChange: (e: React.FormEvent<HTMLInputElement>) => void
  onBlur: (e: React.FormEvent<HTMLInputElement>) => void
  error: string // TODO: Show errors in the UI
}

const GrantRequestDesiredFunding = ({ disabled, value, onChange, onBlur }: Props) => {
  const t = useFormatMessage()

  return (
    <div>
      <Label className="GrantRequestSection__InputTitle">
        {t('page.submit_grant.funding_section.desired_funding')}
      </Label>
      <div>
        <div className="GrantRequestDesiredFunding__InputContainer">
          <div className="GrantRequestDesiredFunding__Currency">USD</div>
          <input
            className="GrantRequestDesiredFunding__Input"
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

export default GrantRequestDesiredFunding
