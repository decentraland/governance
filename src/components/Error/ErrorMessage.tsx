import React, { useCallback, useState } from 'react'

import Link from 'decentraland-gatsby/dist/components/Text/Link'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useClipboardCopy from 'decentraland-gatsby/dist/hooks/useClipboardCopy'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import ErrorNotice from '../Icon/ErrorNotice'

import './ErrorMessage.css'

interface Props {
  label: string
  errorMessage: string
}

export default function ErrorMessage({ label, errorMessage }: Props) {
  const t = useFormatMessage()
  const [copied, state] = useClipboardCopy(Time.Second)
  const [open, setOpen] = useState(false)

  const toggleHandler = () => {
    setOpen(!open)
  }

  const handleCopy = useCallback(() => {
    state.copy(errorMessage)
  }, [errorMessage, state])

  return (
    <div className="ErrorMessage__Container">
      <div className="ErrorMessage__Header">
        <ErrorNotice />
        <span>{label}</span>
        <Button className="ErrorMessage__Show" basic as={Link} onClick={toggleHandler}>
          {open ? t('error.message.hide') : t('error.message.show')}
        </Button>
      </div>
      <div className={TokenList.join(['ErrorMessage__Content', open && 'ErrorMessage__Content--open'])}>
        <div className="ErrorMessage__Message">
          <pre>{errorMessage}</pre>
          <Button
            className={TokenList.join(['Button', 'ErrorMessage__Copy'])}
            primary
            size="small"
            onClick={handleCopy}
          >
            <span>{copied ? t('error.message.copied') : t('error.message.copy')}</span>
          </Button>
        </div>
        <Markdown className="ErrorMessage__CallForAction">{t('error.message.call_for_action')}</Markdown>
      </div>
    </div>
  )
}
