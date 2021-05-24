import React from "react"
import { Header } from "decentraland-ui/dist/components/Header/Header"

import ContentLayout, { ContentSection } from "../../components/Layout/ContentLayout"
import useFormatMessage from "decentraland-gatsby/dist/hooks/useFormatMessage"
import Head from "decentraland-gatsby/dist/components/Head/Head"
import Paragraph from "decentraland-gatsby/dist/components/Text/Paragraph"
import CategoryBanner from "../../components/Category/CategoryBanner"
import { ProposalType } from "../../entities/Proposal/types"
import locations from "../../modules/locations"
import './submit.css'

export default function NewProposalPage() {
  const l = useFormatMessage()

  return <>
  <Head
    title={l('page.submit.title') || ''}
    description={l('page.submit.description') || ''}
    image="https://decentraland.org/images/decentraland.png"
  />
  <ContentLayout className="ProposalDetailPage">
    <ContentSection>
      <Header size="huge">{l('page.submit.title')} &nbsp;</Header>
      <Paragraph>{l('page.submit.description') || ''}</Paragraph>
    </ContentSection>
    <ContentSection>
      <CategoryBanner type={ProposalType.Catalyst} href={locations.submit(ProposalType.Catalyst)} active />
      <CategoryBanner type={ProposalType.POI} href={locations.submit(ProposalType.POI)} active />
      <CategoryBanner type={ProposalType.BanName} href={locations.submit(ProposalType.BanName)} active />
      {/* <CategoryBanner type={ProposalType.Grant} href={locations.submit(ProposalType.Grant)} active /> */}
      <CategoryBanner type={ProposalType.Poll} href={locations.submit(ProposalType.Poll)} active />
    </ContentSection>
  </ContentLayout>
  </>
}
