import React from 'react'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { ProposalSorting } from '../../entities/Proposal/types'

export type SortingMenu = {
  style?: React.CSSProperties,
  value?: ProposalSorting | null,
  onChange?: (e: React.MouseEvent<any>, props: { value: ProposalSorting | null }) => void,
}

export default function StatusMenu(props: SortingMenu) {
  // const l = useFormatMessage()
  function handleChange(e: React.MouseEvent<any>, value: ProposalSorting | null) {
    if (props.onChange) {
      props.onChange(e, { value })
    }
  }

  return <Dropdown text="latest" style={props.style}>
    <Dropdown.Menu>
      <Dropdown.Item text="Latest" onClick={(e) => handleChange(e, null)} />
      <Dropdown.Item text="PARTICIPATION" onClick={(e) => handleChange(e, ProposalSorting.TotalVp)} />
    </Dropdown.Menu>
  </Dropdown>
}