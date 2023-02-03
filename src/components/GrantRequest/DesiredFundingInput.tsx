import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { GRANT_PROPOSAL_MAX_BUDGET, GRANT_PROPOSAL_MIN_BUDGET } from '../../entities/Grant/types'
import Helper from '../Helper/Helper'
import ExclamationCircle from '../Icon/ExclamationCircle'

import './DesiredFundingInput.css'
import Label from './Label'

interface Props {
  disabled: boolean
  value: string | number
  onChange: (e: React.FormEvent<HTMLInputElement>) => void
  onBlur: (e: React.FormEvent<HTMLInputElement>) => void
  error: string // TODO: Show errors in the UI
}

const DesiredFundingInput = ({ disabled, value, onChange, onBlur, error }: Props) => {
  const t = useFormatMessage()
  const showError = error && error.length > 0
  return (
    <div className="DesiredFundingInput">
      <Label>{t('page.submit_grant.funding_section.desired_funding')}</Label>
      <div className="DesiredFundingInput__Container">
        <div
          className={TokenList.join([
            'DesiredFundingInput__InputContainer',
            showError && 'DesiredFundingInput__InputContainerError',
          ])}
        >
          <div
            className={TokenList.join([
              'DesiredFundingInput__Description',
              showError && 'DesiredFundingInput__DescriptionError',
            ])}
          >
            USD
          </div>
          <input
            className={TokenList.join(['DesiredFundingInput__Input', showError && 'DesiredFundingInput__Error'])}
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
        {showError && (
          <div className={'DesiredFundingInput__ErrorHelper'}>
            <Helper
              text={t(error)}
              position="right center"
              open
              icon={<ExclamationCircle color={'red-800'} size={'16px'} />}
            />
          </div>
        )}
      </div>
      <Markdown className="GrantRequestSection__InputSubtitle">
        {t('page.submit_grant.funding_section.desired_funding_sub')}
      </Markdown>
    </div>
  )
}

export default DesiredFundingInput
