import { useMemo } from 'react'

import { TeamMember } from '../../entities/Grant/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import ProposalMarkdown from '../Proposal/View/ProposalMarkdown'

import BreakdownAccordion, { BreakdownItem } from './BreakdownAccordion'
import BreakdownContent from './BreakdownContent'

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
        content: <BreakdownContent description={about} url={relevantLink} />,
      })),
    [members]
  )
  return (
    <>
      <ProposalMarkdown text={`## ${t('page.proposal_view.grant.personnel_title')}`} />
      <BreakdownAccordion items={items} />
    </>
  )
}

export default PersonnelView
