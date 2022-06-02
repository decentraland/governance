import React from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import './CoAuthor.css'
import CoAuthorSelect from './CoAuthorSelect'

function CoAuthor() {
  const t = useFormatMessage()

  return (
    <div className="Co-author">
      <div className="Title__Container">
        <div className="Label">{t('page.submit.co_author_label')}</div>
        <div className="NewBadge">{t('category.new')}</div>
        <sup className="Optional">{t('page.submit.optional_tooltip')}</sup>
      </div>
      <Paragraph tiny secondary className="details">
        {t('page.submit.co_author_description')}
      </Paragraph>
      <CoAuthorSelect />
    </div>
  )
}

export default CoAuthor
