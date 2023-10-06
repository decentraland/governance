import { useMemo, useState } from 'react'

import { Close } from 'decentraland-ui/dist/components/Close/Close'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
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
  const filteredTenderProposals = useMemo(
    () => tenderProposals?.data?.filter((item) => item.id !== proposal.id),
    [proposal.id, tenderProposals?.data]
  )

  if (filteredTenderProposals?.length === 0) {
    return null
  }

  const handleSidebarClose = () => setIsSidebarOpen(false)

  return (
    <>
      <ContentSection>
        <CompetingButton onClick={() => setIsSidebarOpen(true)}>
          {t('page.proposal_detail.competing_tenders.show_sidebar_label', { amount: filteredTenderProposals?.length })}
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
          {filteredTenderProposals?.map((item) => (
            <ProposalCard key={item.id} proposal={item} />
          ))}
        </div>
      </GovernanceSidebar>
    </>
  )
}
