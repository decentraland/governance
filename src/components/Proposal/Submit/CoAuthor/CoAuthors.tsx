import React from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import NewBadge from '../../NewBadge/NewBadge'

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
    <div className="Co-author">
      <div className="Title__Container">
        <div className="Label">{t('page.submit.co_author_label')}</div>
        <sup className="Optional">{t('page.submit.optional_tooltip')}</sup>
      </div>
      <Paragraph tiny secondary className="details">
        {t('page.submit.co_author_description')}
      </Paragraph>
      <CoAuthorSelect setCoAuthors={setCoAuthors} isDisabled={isDisabled} />
    </div>
  )
}

export default CoAuthors
