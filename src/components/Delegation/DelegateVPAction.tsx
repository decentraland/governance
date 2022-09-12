import React from 'react'

import Anchor from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

interface Props {
  address: string
}

function DelegateVPAction({ address }: Props) {
  const t = useFormatMessage()
  return <Anchor onClick={() => console.log('...')}>{t('page.profile.delegators.delegate_action')}</Anchor>
}

export default DelegateVPAction
