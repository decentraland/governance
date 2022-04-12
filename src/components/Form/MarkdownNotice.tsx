import React from 'react'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

export default function MarkdownNotice() {
  const t = useFormatMessage()

  return (
    <Popup
      content={t('page.submit.markdown_notice')}
      position="bottom left"
      inverted
      trigger={<sup>{t('page.submit.markdown_tooltip')}</sup>}
      on="hover"
    />
  )
}
