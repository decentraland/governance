import React, { useCallback, useMemo } from 'react'
import { Control, Controller } from 'react-hook-form'

import type { DropdownItemProps } from 'decentraland-ui'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

import { Committees } from '../../../clients/DclData'
import useDclData from '../../../hooks/useDclData'

interface ExtendedController extends React.ComponentProps<typeof Controller> {
  committee?: Committees | null
  disabled?: boolean
  error?: boolean
  control: Control<any, any>
  onOptionClick?: (event: React.MouseEvent<HTMLDivElement>, data: DropdownItemProps) => void
}

type Props = Omit<ExtendedController, 'render'>

function CommitteeMembersDropdown({ committee, control, disabled, error, onOptionClick, ...props }: Props) {
  const [data] = useDclData()
  const teams = useMemo(() => data?.teams || [], [data])

  const getCommitteeMembers = useCallback(
    (committee: Committees) => {
      const team = teams.find((team) => team.name === committee)
      const members = team?.members || []
      return members.map((member) => ({
        key: member.address,
        value: member.address,
        text: member.name,
        image: { avatar: true, src: member.avatar },
        onClick: onOptionClick,
      }))
    },
    [teams, onOptionClick]
  )

  return (
    <Controller
      control={control}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render={({ field: { ref, onChange, ...field } }) => (
        <Dropdown
          placeholder="Select member"
          fluid
          selection
          options={committee ? getCommitteeMembers(committee) : []}
          disabled={disabled}
          error={error}
          {...field}
        />
      )}
      {...props}
    />
  )
}

export default CommitteeMembersDropdown
