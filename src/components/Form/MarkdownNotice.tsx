import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

export default function MarkdownNotice() {
  const t = useFormatMessage()

  return (
    <Popup
      content={t('page.submit.markdown_notice')}
      position="bottom left"
      trigger={<sup>{t('page.submit.markdown_tooltip')}</sup>}
      on="hover"
    />
  )
}
