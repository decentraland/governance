import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Close } from 'decentraland-ui/dist/components/Close/Close'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { useTenderProposals } from '../../../hooks/useTenderProposals'
import { ContentSection } from '../../Layout/ContentLayout'
import GovernanceSidebar from '../../Sidebar/GovernanceSidebar'

import CompetingButton from './CompetingButton'
import ProposalCard from './ProposalCard'

interface Props {
  proposal: ProposalAttributes
}

export default function CompetingTenders({ proposal }: Props) {
  const t = useFormatMessage()
  const [isSiderbarOpen, setIsSidebarOpen] = useState(false)
  const { tenderProposals } = useTenderProposals(proposal.configuration.linked_proposal_id, proposal?.type)

  if (!tenderProposals?.data) {
    return null
  }

  const handleSidebarClose = () => setIsSidebarOpen(false)

  return (
    <>
      <ContentSection>
        <CompetingButton onClick={() => setIsSidebarOpen(true)}>
          {t('page.proposal_detail.competing_tenders.show_sidebar_label', { amount: tenderProposals?.total })}
        </CompetingButton>
      </ContentSection>
      <GovernanceSidebar visible={isSiderbarOpen} onClose={handleSidebarClose}>
        <div className="CompetingProposalsSidebar__TitleContainer">
          <span className="CompetingProposalsSidebar__Title">
            {t('page.proposal_detail.competing_tenders.sidebar_title')}
          </span>
          <Close onClick={handleSidebarClose} />
        </div>
        <div>
          {tenderProposals.data.map((item) => (
            <ProposalCard key={item.id} proposal={item} />
          ))}
        </div>
      </GovernanceSidebar>
    </>
  )
}