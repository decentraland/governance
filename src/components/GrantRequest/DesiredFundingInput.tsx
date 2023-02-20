import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

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
  error: string
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
            showError && 'DesiredFundingInput__InputContainer--Error',
          ])}
        >
          <div
            className={TokenList.join([
              'DesiredFundingInput__Description',
              showError && 'DesiredFundingInput__Description--Error',
            ])}
          >
            USD
          </div>
          <input
            className={'DesiredFundingInput__Input'}
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
      <Markdown className="GrantRequestSection__InputSubtitle">
        {t('page.submit_grant.funding_section.desired_funding_sub')}
      </Markdown>
    </div>
  )
}

export default DesiredFundingInput
