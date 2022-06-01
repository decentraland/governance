import React from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import CoAuthorSelect from './CoAuthorSelect'

function CoAuthor() {
  const t = useFormatMessage()

  return (
    <div className="Co-author">
      <Header sub>{t('page.submit.co_author_label')}</Header>
      <Paragraph tiny secondary className="details">
        {t('page.submit.co_author_description')}
      </Paragraph>
      <CoAuthorSelect />
    </div>
  )
}

export default CoAuthor
