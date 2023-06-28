import React, { useState } from 'react'

import classNames from 'classnames'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import useClipboardCopy from '../../hooks/useClipboardCopy'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import Link from '../Common/Link'
import ErrorNotice from '../Icon/ErrorNotice'

import './ErrorMessage.css'

interface Props {
  label: string
  errorMessage: string
}

export default function ErrorMessage({ label, errorMessage }: Props) {
  const t = useFormatMessage()
  const { copiedValue, handleCopy } = useClipboardCopy(Time.Second)
  const [open, setOpen] = useState(false)

  const toggleHandler = () => {
    setOpen(!open)
  }

  return (
    <div className="ErrorMessage__Container">
      <div className="ErrorMessage__Header">
        <ErrorNotice />
        <span>{label}</span>
        <Button className="ErrorMessage__Show" basic as={Link} onClick={toggleHandler}>
          {open ? t('error.message.hide') : t('error.message.show')}
        </Button>
      </div>
      <div className={classNames('ErrorMessage__Content', open && 'ErrorMessage__Content--open')}>
        <div className="ErrorMessage__Message">
          <pre>{errorMessage}</pre>
          <Button
            className={classNames('Button', 'ErrorMessage__Copy')}
            primary
            size="small"
            onClick={() => handleCopy(errorMessage)}
          >
            <span>{copiedValue ? t('error.message.copied') : t('error.message.copy')}</span>
          </Button>
        </div>
        <Markdown className="ErrorMessage__CallForAction">{t('error.message.call_for_action')}</Markdown>
      </div>
    </div>
  )
}
