import { useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { shortenText } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import Heading from '../Common/Typography/Heading'
import Text from '../Common/Typography/Text'

import './Bio.css'

interface Props {
  text: string
}

const BIO_PREVIEW_MAX_LENGTH = 140

function Bio({ text }: Props) {
  const [expanded, setExpanded] = useState(false)
  const t = useFormatMessage()
  return (
    <div className="Bio__Container">
      <Heading size="2xs" weight="medium" className="Bio__Heading">
        {t('page.profile.bio.title')}
      </Heading>
      <Text className="Bio__Text">{expanded ? text : shortenText(text, BIO_PREVIEW_MAX_LENGTH)}</Text>
      {text.length > BIO_PREVIEW_MAX_LENGTH && (
        <Button basic className="Bio__Button" onClick={() => setExpanded(!expanded)}>
          {t(`page.profile.bio.${expanded ? 'show_less' : 'show_more'}`)}
        </Button>
      )}
    </div>
  )
}

export default Bio
