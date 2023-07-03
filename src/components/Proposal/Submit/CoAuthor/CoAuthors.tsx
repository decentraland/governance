import React from 'react'

import useFormatMessage from '../../../../hooks/useFormatMessage'
import SubLabel from '../../../Common/SubLabel'
import Label from '../../../Common/Typography/Label'

import CoAuthorSelect from './CoAuthorSelect'
import './CoAuthors.css'

interface CoAuthors {
  coAuthors?: string[]
}

export interface CoAuthorProps {
  setCoAuthors: (addresses?: string[]) => void
  isDisabled?: boolean
}

function CoAuthors({ setCoAuthors, isDisabled }: CoAuthorProps) {
  const t = useFormatMessage()

  return (
    <div className="CoAuthors">
      <div className="CoAuthors__LabelContainer">
        <Label>{t('page.submit.co_author_label')}</Label>
        <sup className="Optional">{t('page.submit.optional_tooltip')}</sup>
      </div>
      <SubLabel>{t('page.submit.co_author_description')}</SubLabel>
      <CoAuthorSelect setCoAuthors={setCoAuthors} isDisabled={isDisabled} />
    </div>
  )
}

export default CoAuthors
