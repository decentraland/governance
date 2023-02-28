import React, { useState } from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import CategoryBanner from '../../components/Category/CategoryBanner'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import { POIProposalModal } from '../../components/Modal/POIProposalModal/POIProposalModal'
import { ProposalType } from '../../entities/Proposal/types'
import { isGrantProposalSubmitEnabled } from '../../entities/Proposal/utils'
import locations from '../../modules/locations'

import './submit.css'

const NOW = Date.now()

export default function NewProposalPage() {
  const t = useFormatMessage()
  const [showPOIProposalModal, setShowPOIProposalModal] = useState(false)

  return (
    <>
      <Head
        title={t('page.submit.title') || ''}
        description={t('page.submit.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <ContentLayout className="ProposalDetailPage">
        <ContentSection>
          <Header size="huge">{t('page.submit.title')} &nbsp;</Header>
          <Paragraph>{t('page.submit.description') || ''}</Paragraph>
        </ContentSection>
        <ContentSection>
          <Header sub className="ProposalDetailPage_SubHeader">
            {t('page.submit.common_actions')}
          </Header>
          <CategoryBanner type={ProposalType.Catalyst} href={locations.submit(ProposalType.Catalyst)} />
          <CategoryBanner type={ProposalType.POI} onClick={() => setShowPOIProposalModal(true)} />
          <CategoryBanner type={ProposalType.BanName} href={locations.submit(ProposalType.BanName)} />
          <CategoryBanner type={ProposalType.LinkedWearables} href={locations.submit(ProposalType.LinkedWearables)} />
          <CategoryBanner
            type={ProposalType.Grant}
            href={locations.submit(ProposalType.Grant)}
            active={isGrantProposalSubmitEnabled(NOW)}
          />
        </ContentSection>
        <ContentSection>
          <Header sub className="ProposalDetailPage_SubHeader">
            {t('page.submit.governance_process')}
          </Header>
          <CategoryBanner type={ProposalType.Poll} href={locations.submit(ProposalType.Poll)} />
        </ContentSection>
      </ContentLayout>

      <POIProposalModal open={showPOIProposalModal} onClose={() => setShowPOIProposalModal(false)} />
    </>
  )
}
