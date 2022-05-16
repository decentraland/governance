import React, { useState } from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import CategoryBanner from '../../components/Category/CategoryBanner'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import { POIProposalModal } from '../../components/Modal/POIProposalModal/POIProposalModal'
import { ProposalType } from '../../entities/Proposal/types'
import locations from '../../modules/locations'

import './submit.css'

export default function NewProposalPage() {
  const t = useFormatMessage()
  const [show, setShow] = useState(false)

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
            Common Actions
          </Header>
          <CategoryBanner type={ProposalType.Catalyst} href={locations.submit(ProposalType.Catalyst)} active />
          <CategoryBanner type={ProposalType.POI} onClick={() => setShow(true)} active />
          <CategoryBanner type={ProposalType.BanName} href={locations.submit(ProposalType.BanName)} active />
          <CategoryBanner type={ProposalType.Grant} href={locations.submit(ProposalType.Grant)} active />
          <CategoryBanner
            type={ProposalType.LinkedWearables}
            href={locations.submit(ProposalType.LinkedWearables)}
            active
            isNew
          />
        </ContentSection>
        <ContentSection>
          <Header sub className="ProposalDetailPage_SubHeader">
            Governance Process
          </Header>
          <CategoryBanner type={ProposalType.Poll} href={locations.submit(ProposalType.Poll)} active />
        </ContentSection>
      </ContentLayout>

      <POIProposalModal open={show} onClose={() => setShow(false)} />
    </>
  )
}
