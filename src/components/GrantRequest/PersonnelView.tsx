import { useMemo } from 'react'

import { TeamMember } from '../../entities/Grant/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import ProposalMarkdown from '../Proposal/View/ProposalMarkdown'

import BreakdownAccordion, { BreakdownItem } from './BreakdownAccordion'
import BreakdownContent, { BreakdownContentProps } from './BreakdownContent'

interface Props {
  members: TeamMember[]
}

function PersonnelView({ members }: Props) {
  const t = useFormatMessage()
  const items = useMemo(
    () =>
      members.map<BreakdownItem<BreakdownContentProps>>(({ name, role, about, relevantLink }) => ({
        title: name,
        subtitle: role,
        contentProps: {
          description: about,
          url: relevantLink,
        },
        content: ({ description, url }) => <BreakdownContent description={description} url={url} />,
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
