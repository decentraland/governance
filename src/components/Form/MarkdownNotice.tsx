import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import useFormatMessage from '../../hooks/useFormatMessage'

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
