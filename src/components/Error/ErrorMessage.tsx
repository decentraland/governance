import React from 'react'

import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import ErrorNotice from '../Icon/ErrorNotice'

import './ErrorMessage.css'

interface Props {
  label: string
  errorMessage: string
}

export default function ErrorMessage({ label, errorMessage }: Props) {
  const t = useFormatMessage()

  return (
    <div className="ErrorMessage__Container">
      <div className="ErrorMessage__Header">
        <ErrorNotice />
        <span>{label}</span>
        <Button className="ErrorMessage__Show" basic as={Link} href={'/'}>
          {'Hide error'}
        </Button>
      </div>
      <div className="ErrorMessage__Message">
        <pre>{errorMessage}</pre>
        <div className="ErrorMessage__Copy">
          <span>{'Copy to Clipboard'}</span>
        </div>
      </div>
      <span className="ErrorMessage__CallForAction">
        We rely on an external service that can fail. However, feel free to post this error message on
        <Link className="ErrorMessage__DiscordLink" href={'/'}>
          {'Discord'}
        </Link>
        .
      </span>
    </div>
  )
}
