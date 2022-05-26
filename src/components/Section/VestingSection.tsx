import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import './DetailsSection.css'
import './VestingSection.css'

interface Props {
  vestingAddress: string
}

function VestingSection({ vestingAddress }: Props) {
  const vestingUrl = process.env.GATSBY_VESTING_DASHBOARD_URL
  const t = useFormatMessage()

  if (!vestingUrl) {
    console.error('Vesting Dashboard URL not found')
    return <></>
  }

  const url = vestingUrl.replace('%23', '#').concat(vestingAddress.toLowerCase())

  return (
    <div className="VestingSection DetailsSection">
      <div className="DetailsSection__Content">
        <div className="VestingLabel">{t('page.proposal_detail.grant.vesting_label')}</div>
        <Markdown>{t('page.proposal_detail.grant.vesting_description')}</Markdown>
        <Button href={url} target="_blank" rel="noopener noreferrer" primary size="small">
          {t('page.proposal_detail.grant.vesting_button')}
        </Button>
      </div>
    </div>
  )
}

export default VestingSection
