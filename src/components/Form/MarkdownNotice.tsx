import React from 'react'
import { Popup } from "decentraland-ui/dist/components/Popup/Popup"
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'


export default function MarkdownNotice() {
  const l = useFormatMessage();

  return <Popup
    content={l('page.submit.markdown_notice')}
    position="bottom left"
    inverted
    trigger={<sup>{l('page.submit.markdown_tooltip')}</sup>}
    on="hover"
  />
}