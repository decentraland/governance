import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import usePaginatedProposals from '../../hooks/usePaginatedProposals'
import BoxTabs from '../Common/BoxTabs'
import BoxTabsContainer from '../Common/BoxTabsContainer'
import BoxTabsContentContainer from '../Common/BoxTabsContentContainer'
import Empty from '../Common/Empty'
import FullWidthButton from '../Common/FullWidthButton'
import SkeletonBars from '../Common/SkeletonBars'
import Watermelon from '../Icon/Watermelon'

import ProposalCreatedItem from './ProposalCreatedItem'
import './ProposalsCreatedBox.css'

interface Props {
  address: string
}

enum Tab {
  ProposalsCreated = 'proposals_created',
  CoAuthoring = 'coauthoring',
}

const PROPOSALS_PER_PAGE = 5

function ProposalsCreatedBox({ address }: Props) {
  const t = useFormatMessage()
  const [activeTab, setActiveTab] = useState(Tab.ProposalsCreated)

  const {
    proposals,
    isLoadingProposals: isLoading,
    loadMore,
    hasMoreProposals,
  } = usePaginatedProposals({
    user: address.toLowerCase(),
    itemsPerPage: PROPOSALS_PER_PAGE,
  })

  return (
    <Container>
      <BoxTabsContainer>
        <BoxTabs>
          <BoxTabs.Left>
            <BoxTabs.Tab onClick={() => setActiveTab(Tab.ProposalsCreated)} active={activeTab === Tab.ProposalsCreated}>
              {t('page.profile.created_proposals.title')}
            </BoxTabs.Tab>
            <BoxTabs.Tab onClick={() => setActiveTab(Tab.CoAuthoring)} active={activeTab === Tab.CoAuthoring}>
              {t('page.profile.activity.coauthoring.title')}
            </BoxTabs.Tab>
          </BoxTabs.Left>
        </BoxTabs>
        <BoxTabsContentContainer>
          {activeTab === Tab.ProposalsCreated && (
            <>
              {isLoading && <SkeletonBars amount={proposals.length || PROPOSALS_PER_PAGE} height={89} />}
              {!isLoading &&
                (proposals && proposals.length > 0 ? (
                  proposals.map((proposal) => <ProposalCreatedItem key={proposal.id} proposal={proposal} />)
                ) : (
                  <Empty
                    className="ProposalsCreatedBox__Empty"
                    icon={<Watermelon />}
                    description={t('page.profile.created_proposals.empty')}
                  />
                ))}
              {hasMoreProposals && (
                <FullWidthButton onClick={loadMore}>{t('page.profile.created_proposals.button')}</FullWidthButton>
              )}
            </>
          )}
        </BoxTabsContentContainer>
      </BoxTabsContainer>
    </Container>
  )
}

export default ProposalsCreatedBox
