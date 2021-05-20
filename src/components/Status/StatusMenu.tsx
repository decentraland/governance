import React from 'react'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { ProposalStatus } from '../../entities/Proposal/types'

export type StatusMenu = {
  style?: React.CSSProperties,
  value?: ProposalStatus | null,
  onChange?: (e: React.MouseEvent<any>, props: { value: ProposalStatus | null }) => void,
}

export default function StatusMenu(props: StatusMenu) {
  const l = useFormatMessage()
  function handleChange(e: React.MouseEvent<any>, value: ProposalStatus | null) {
    if (props.onChange) {
      props.onChange(e, { value })
    }
  }

  return <Dropdown text={l(`status.${props.value || 'all'}`) || ''} style={props.style}>
    <Dropdown.Menu>
      <Dropdown.Item text={l(`status.all`)} onClick={(e) => handleChange(e, null)} />
      <Dropdown.Item text={l(`status.${ProposalStatus.Active}`)} onClick={(e) => handleChange(e, ProposalStatus.Active)} />
      <Dropdown.Item text={l(`status.${ProposalStatus.Finished}`)} onClick={(e) => handleChange(e, ProposalStatus.Finished)} />
      <Dropdown.Item text={l(`status.${ProposalStatus.Passed}`)} onClick={(e) => handleChange(e, ProposalStatus.Passed)} />
      <Dropdown.Item text={l(`status.${ProposalStatus.Rejected}`)} onClick={(e) => handleChange(e, ProposalStatus.Rejected)} />
      <Dropdown.Item text={l(`status.${ProposalStatus.Enacted}`)} onClick={(e) => handleChange(e, ProposalStatus.Enacted)} />
    </Dropdown.Menu>
  </Dropdown>
}