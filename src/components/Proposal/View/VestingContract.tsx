import React, { useEffect } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import Menu from 'semantic-ui-react/dist/commonjs/collections/Menu'

import useFormatMessage from '../../../hooks/useFormatMessage'
import useVestingContractData from '../../../hooks/useVestingContractData'
import { env } from '../../../utils/env'
import Pill from '../../Common/Pill'
import Markdown from '../../Common/Typography/Markdown'

import './DetailsSection.css'
import './VestingContract.css'

const VESTING_DASHBOARD_URL = env('GATSBY_VESTING_DASHBOARD_URL')

interface Props {
  vestingAddresses: string[]
}

function VestingContract({ vestingAddresses }: Props) {
  const t = useFormatMessage()
  const vestingAddressIsEmpty = vestingAddresses.length === 0
  const vestingAddress = '0xa27ab97c1f181adb276377b6cfb0b35bf57df0a1'

  const { vestingData } = useVestingContractData(vestingAddress)
  useEffect(() => {
    console.log('vestingData', vestingData)
  }, [vestingData])

  if (!VESTING_DASHBOARD_URL) {
    console.error('Vesting Dashboard URL not found')
    return <></>
  }

  const url = VESTING_DASHBOARD_URL.replace('%23', '#').concat(vestingAddress?.toLowerCase())

  const options = [
    {
      key: 1,
      text: (
        <div>
          <div>Choice 1</div>
          <div>Active</div>
        </div>
      ),
      value: 1,
      onClick: () => console.log('click'),
    },
    { key: 2, text: 'Choice 2', value: 2 },
    { key: 3, text: 'Choice 3', value: 3 },
  ]

  return (
    <>
      {!vestingAddressIsEmpty && (
        <div className="VestingContract DetailsSection DetailsSection--shiny">
          <div className="DetailsSection__Content">
            <Pill color="green" style="shiny" size="sm">
              {t('page.proposal_detail.grant.vesting_label')}
            </Pill>
            <Markdown
              className="VestingContract__Description"
              componentsClassNames={{ strong: 'VestingContract__Description__StrongText' }}
            >
              {t('page.proposal_detail.grant.vesting_description')}
            </Markdown>
            <Menu className="VestingContract__Menu">
              <Dropdown
                className="VestingContract__Dropdown"
                text={t('page.proposal_detail.grant.vesting_dropdown')}
                options={options}
                simple
                item
              />
            </Menu>
            {/* <Button href={url} target="_blank" rel="noopener noreferrer" primary size="small">
              {t('page.proposal_detail.grant.vesting_button')}
            </Button> */}
          </div>
        </div>
      )}
    </>
  )
}

export default VestingContract
