import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'

import { ProposalStatus } from '../../entities/Proposal/types'

export type StatusMenu = {
  style?: React.CSSProperties
  value?: ProposalStatus | null
  onChange?: (e: React.MouseEvent<unknown>, props: { value: ProposalStatus | null }) => void
}

export default function StatusMenu(props: StatusMenu) {
  const t = useFormatMessage()
  function handleChange(e: React.MouseEvent<unknown>, value: ProposalStatus | null) {
    if (props.onChange) {
      props.onChange(e, { value })
    }
  }

  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })

  return (
    <Dropdown
      text={t(`status.${props.value || 'all'}`) || ''}
      direction={isMobile ? 'left' : 'right'}
      style={props.style}
    >
      <Dropdown.Menu>
        <Dropdown.Item text={t(`status.all`)} onClick={(e) => handleChange(e, null)} />
        <Dropdown.Item
          text={t(`status.${ProposalStatus.Active}`)}
          onClick={(e) => handleChange(e, ProposalStatus.Active)}
        />
        <Dropdown.Item
          text={t(`status.${ProposalStatus.Finished}`)}
          onClick={(e) => handleChange(e, ProposalStatus.Finished)}
        />
        <Dropdown.Item
          text={t(`status.${ProposalStatus.Passed}`)}
          onClick={(e) => handleChange(e, ProposalStatus.Passed)}
        />
        <Dropdown.Item
          text={t(`status.${ProposalStatus.Rejected}`)}
          onClick={(e) => handleChange(e, ProposalStatus.Rejected)}
        />
        <Dropdown.Item
          text={t(`status.${ProposalStatus.Enacted}`)}
          onClick={(e) => handleChange(e, ProposalStatus.Enacted)}
        />
      </Dropdown.Menu>
    </Dropdown>
  )
}
