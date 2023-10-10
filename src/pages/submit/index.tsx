import { useState } from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import CategoryBanner from '../../components/Category/CategoryBanner'
import Text from '../../components/Common/Typography/Text'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import {
  AddRemoveProposalModal,
  AddRemoveProposalModalProps,
} from '../../components/Modal/AddRemoveProposalModal/AddRemoveProposalModal'
import { getCommitteesWithOpenSlots } from '../../entities/Committee/utils'
import { CatalystType, HiringType, PoiType, ProposalType } from '../../entities/Proposal/types'
import { isGrantProposalSubmitEnabled } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import locations from '../../utils/locations'

import './submit.css'

const NOW = Date.now()

const POI_MODAL_PROPS: AddRemoveProposalModalProps = {
  open: false,
  title: 'poi',
  proposalType: ProposalType.POI,
  addType: PoiType.AddPOI,
  removeType: PoiType.RemovePOI,
}

const HIRING_MODAL_PROPS: AddRemoveProposalModalProps = {
  open: false,
  title: 'hiring',
  proposalType: ProposalType.Hiring,
  addType: HiringType.Add,
  isAddDisabled: true,
  removeType: HiringType.Remove,
}

const CATALYST_MODAL_PROPS: AddRemoveProposalModalProps = {
  open: false,
  title: 'catalyst',
  proposalType: ProposalType.Catalyst,
  addType: CatalystType.Add,
  removeType: CatalystType.Remove,
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
          <Header size="huge">{t('page.submit.title')}</Header>
          <Text size="lg" weight="normal">
            {t('page.submit.description') || ''}
          </Text>
        </ContentSection>
        <ContentSection>
          <Text className="SubmitPage__Header" size="sm" weight="semi-bold" color="secondary">
            {t('page.submit.common_actions')}
          </Text>
          <CategoryBanner
            type={ProposalType.Catalyst}
            onClick={() => setProposalModalProps({ ...CATALYST_MODAL_PROPS, open: true })}
          />
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
          <Text className="SubmitPage__Header" size="sm" weight="semi-bold" color="secondary">
            {t('page.submit.bidding_tendering_process')}
          </Text>
          <CategoryBanner isNew type={ProposalType.Pitch} href={locations.submit(ProposalType.Pitch)} />
        </ContentSection>
        <ContentSection>
          <Text className="SubmitPage__Header" size="sm" weight="semi-bold" color="secondary">
            {t('page.submit.governance_process')}
          </Text>
          <CategoryBanner type={ProposalType.Poll} href={locations.submit(ProposalType.Poll)} />
        </ContentSection>
      </ContentLayout>

      <AddRemoveProposalModal {...proposalModalProps} onClose={closeProposalModal} />
    </>
  )
}
