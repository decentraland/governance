import React, { useMemo } from 'react'

import { TeamMember } from '../../entities/Grant/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import { PROPOSAL_DESCRIPTION_MARKDOWN_STYLES } from '../../pages/proposal'
import Markdown from '../Common/Typography/Markdown'

import BreakdownAccordion, { BreakdownItem } from './BreakdownAccordion'

interface Props {
  members: TeamMember[]
}

function PersonnelView({ members }: Props) {
  const t = useFormatMessage()
  const items = useMemo(
    () =>
      members.map<BreakdownItem>(({ name, role, about, relevantLink }) => ({
        title: name,
        subtitle: role,
        description: about,
        url: relevantLink,
      })),
    [members]
  )
  return (
    <>
      <Markdown componentsClassNames={PROPOSAL_DESCRIPTION_MARKDOWN_STYLES}>{`## ${t(
        'page.proposal_view.grant.personnel_title'
      )}`}</Markdown>
      <BreakdownAccordion items={items} />
    </>
  )
}

export default PersonnelView
