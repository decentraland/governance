import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { env } from '../../../utils/env'
import Markdown from '../../Common/Markdown/Markdown'
import Pill from '../../Common/Pill'

import './DetailsSection.css'
import './VestingContract.css'

const VESTING_DASHBOARD_URL = env('GATSBY_VESTING_DASHBOARD_URL')

interface Props {
  vestingAddress: string
}

function VestingContract({ vestingAddress }: Props) {
  const t = useFormatMessage()

  if (!VESTING_DASHBOARD_URL) {
    console.error('Vesting Dashboard URL not found')
    return <></>
  }

  const url = VESTING_DASHBOARD_URL.replace('%23', '#').concat(vestingAddress.toLowerCase())

  return (
    <div className="VestingContract DetailsSection DetailsSection--shiny">
      <div className="DetailsSection__Content">
        <Pill color="green" style="shiny" size="small">
          {t('page.proposal_detail.grant.vesting_label')}
        </Pill>
        <Markdown>{t('page.proposal_detail.grant.vesting_description')}</Markdown>
        <Button href={url} target="_blank" rel="noopener noreferrer" primary size="small">
          {t('page.proposal_detail.grant.vesting_button')}
        </Button>
      </div>
    </div>
  )
}

export default VestingContract
