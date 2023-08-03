import React from 'react'

import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import Menu from 'semantic-ui-react/dist/commonjs/collections/Menu'

import { VestingInfo } from '../../../clients/VestingData'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useVestingContractData from '../../../hooks/useVestingContractData'
import Pill from '../../Common/Pill'
import Markdown from '../../Common/Typography/Markdown'

import './DetailsSection.css'
import './VestingContract.css'
import VestingContractItem from './VestingContractItem'

interface Props {
  vestingAddresses: string[]
}

function getDropdownItems(vestingData: VestingInfo[] | undefined) {
  if (!vestingData) {
    return undefined
  }

  return vestingData.map((vestingInfo, idx) => {
    const { logs, vestingStartAt, address } = vestingInfo
    return {
      key: address,
      text: <VestingContractItem address={address} itemNumber={idx + 1} logs={logs} vestingStartAt={vestingStartAt} />,
    }
  })
}

function VestingContract({ vestingAddresses }: Props) {
  const t = useFormatMessage()

  // Agregar divider y arrow

  const vestingAddressesExample = [
    '0x37cdfc5e4e9b9642648948568f8a4b2563719d48',
    '0x0BB8270345bf29c2Bb57c84E454830C4a0A6BaF4',
    '0x142FD01F8433361E068D26d112769806a118D095',
  ]

  const { vestingData } = useVestingContractData(vestingAddressesExample)

  return (
    <>
      {vestingData && (
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
                options={getDropdownItems(vestingData)}
                simple
                item
              />
            </Menu>
          </div>
        </div>
      )}
    </>
  )
}

export default VestingContract
