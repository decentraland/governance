import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import Menu from 'semantic-ui-react/dist/commonjs/collections/Menu'

import { VestingInfo } from '../../../clients/VestingData'
import { getVestingContractUrl } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useVestingContractData from '../../../hooks/useVestingContractData'
import Pill from '../../Common/Pill'
import Link from '../../Common/Typography/Link'
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

  const vestingsAmount = vestingData.length

  return vestingData.map((vestingInfo, idx) => {
    const { logs, vestingStartAt, address } = vestingInfo
    return {
      key: address,
      text: (
        <VestingContractItem
          address={address}
          itemNumber={vestingsAmount - idx}
          logs={logs}
          vestingStartAt={vestingStartAt}
        />
      ),
    }
  })
}

function VestingContract({ vestingAddresses }: Props) {
  const t = useFormatMessage()

  const { vestingData } = useVestingContractData(vestingAddresses)

  return (
    <>
      {vestingData && vestingData.length > 0 && (
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
            {vestingData.length > 1 ? (
              <Menu className="VestingContract__Menu">
                <Dropdown
                  className="VestingContract__Dropdown"
                  text={t('page.proposal_detail.grant.vesting_dropdown', { amount: vestingData.length })}
                  options={getDropdownItems(vestingData)}
                  simple
                  item
                />
              </Menu>
            ) : (
              <Button href={getVestingContractUrl(vestingData[0].address)} as={Link} primary size="small">
                {t('page.proposal_detail.grant.vesting_dropdown', { amount: vestingData.length })}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default VestingContract
