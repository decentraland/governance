import React from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { PoiType, ProposalType } from '../../../entities/Proposal/types'
import locations from '../../../modules/locations'
import CategoryBanner from '../../Category/CategoryBanner'
import '../ProposalModal.css'

export function POIProposalModal({ ...props }) {
  const t = useFormatMessage()

  return (
    <Modal {...props} size="tiny" className={TokenList.join(['ProposalModal', props.className])} closeIcon={<Close />}>
      <Modal.Content className="ProposalModal__Title">
        <Header>{t('category.poi_title')}</Header>
        <Paragraph small>{t('modal.poi_proposal.description')}</Paragraph>
      </Modal.Content>
      <Modal.Content className="PoiProposalModal__Actions">
        <CategoryBanner
          type={PoiType.AddPOI}
          href={locations.submit(ProposalType.POI, { request: PoiType.AddPOI })}
          active
        />
        <CategoryBanner
          type={PoiType.RemovePOI}
          href={locations.submit(ProposalType.POI, { request: PoiType.RemovePOI })}
          active
        />
      </Modal.Content>
    </Modal>
  )
}
