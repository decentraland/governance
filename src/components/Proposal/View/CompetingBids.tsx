import { useMemo, useState } from 'react'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { useBidProposals } from '../../../hooks/useBidProposals'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { ContentSection } from '../../Layout/ContentLayout'
import GovernanceSidebar from '../../Sidebar/GovernanceSidebar'

import CompetingButton from './CompetingButton'
import ProposalCard from './ProposalCard'

interface Props {
  proposal: ProposalAttributes
}

export default function CompetingBids({ proposal }: Props) {
  const t = useFormatMessage()
  const [isSiderbarOpen, setIsSidebarOpen] = useState(false)
  const { bidProposals } = useBidProposals(proposal.configuration.linked_proposal_id, proposal?.type)
  const filteredBidProposals = useMemo(
    () => bidProposals?.data?.filter((item) => item.id !== proposal.id),
    [proposal.id, bidProposals?.data]
  )

  if (filteredBidProposals?.length === 0) {
    return null
  }

  const handleSidebarClose = () => setIsSidebarOpen(false)

  return (
    <>
      <ContentSection>
        <CompetingButton onClick={() => setIsSidebarOpen(true)}>
          {t('page.proposal_detail.competing_bids.show_sidebar_label', { amount: filteredBidProposals?.length })}
        </CompetingButton>
      </ContentSection>
      <GovernanceSidebar
        title={t('page.proposal_detail.competing_bids.sidebar_title')}
        visible={isSiderbarOpen}
        onClose={handleSidebarClose}
      >
        <div>
          {filteredBidProposals?.map((item) => (
            <ProposalCard key={item.id} proposal={item} />
          ))}
        </div>
      </GovernanceSidebar>
    </>
  )
}
