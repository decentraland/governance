import React, { useState } from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import CategoryBanner from '../../components/Category/CategoryBanner'
import Text from '../../components/Common/Text/Text'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import {
  AddRemoveProposalModal,
  AddRemoveProposalModalProps,
} from '../../components/Modal/AddRemoveProposalModal/AddRemoveProposalModal'
import { getCommitteesWithOpenSlots } from '../../entities/Committee/utils'
import { HiringType, PoiType, ProposalType } from '../../entities/Proposal/types'
import { isGrantProposalSubmitEnabled } from '../../entities/Proposal/utils'
import locations from '../../modules/locations'

import './submit.css'

const NOW = Date.now()

const POI_MODAL_PROPS: AddRemoveProposalModalProps = {
  open: false,
  title: 'poi',
  addType: PoiType.AddPOI,
  addHref: locations.submit(ProposalType.POI, { request: PoiType.AddPOI }),
  removeType: PoiType.RemovePOI,
  removeHref: locations.submit(ProposalType.POI, { request: PoiType.RemovePOI }),
}

const HIRING_MODAL_PROPS: AddRemoveProposalModalProps = {
  open: false,
  title: 'hiring',
  addType: HiringType.Add,
  addHref: locations.submit(ProposalType.Hiring, { request: HiringType.Add }),
  isAddDisabled: true,
  removeType: HiringType.Remove,
  removeHref: locations.submit(ProposalType.Hiring, { request: HiringType.Remove }),
}

export default function NewProposalPage() {
  const t = useFormatMessage()
  const [proposalModalProps, setProposalModalProps] = useState(POI_MODAL_PROPS)

  const closeProposalModal = () => setProposalModalProps((props) => ({ ...props, open: false }))
  const setHiringModalProps = async () => {
    setProposalModalProps({ ...HIRING_MODAL_PROPS, open: true })
    const availableCommittees = await getCommitteesWithOpenSlots()
    setProposalModalProps((prev) => ({ ...prev, isAddDisabled: availableCommittees.length === 0 }))
  }

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
          <Text size="xl">{t('page.submit.description') || ''}</Text>
        </ContentSection>
        <ContentSection>
          <Header sub className="ProposalDetailPage_SubHeader">
            {t('page.submit.common_actions')}
          </Header>
          <CategoryBanner type={ProposalType.Catalyst} href={locations.submit(ProposalType.Catalyst)} />
          <CategoryBanner
            type={ProposalType.POI}
            onClick={() => setProposalModalProps({ ...POI_MODAL_PROPS, open: true })}
          />
          <CategoryBanner type={ProposalType.BanName} href={locations.submit(ProposalType.BanName)} />
          <CategoryBanner type={ProposalType.LinkedWearables} href={locations.submit(ProposalType.LinkedWearables)} />
          <CategoryBanner
            type={ProposalType.Grant}
            href={locations.submit(ProposalType.Grant)}
            active={isGrantProposalSubmitEnabled(NOW)}
          />
          <CategoryBanner isNew type={ProposalType.Hiring} onClick={setHiringModalProps} />
        </ContentSection>
        <ContentSection>
          <Header sub className="ProposalDetailPage_SubHeader">
            {t('page.submit.bidding_tendering_process')}
          </Header>
          <CategoryBanner isNew type={ProposalType.Pitch} href={locations.submit(ProposalType.Pitch)} />
        </ContentSection>
        <ContentSection>
          <Header sub className="ProposalDetailPage_SubHeader">
            {t('page.submit.governance_process')}
          </Header>
          <CategoryBanner type={ProposalType.Poll} href={locations.submit(ProposalType.Poll)} />
        </ContentSection>
      </ContentLayout>

      <AddRemoveProposalModal {...proposalModalProps} onClose={closeProposalModal} />
    </>
  )
}
