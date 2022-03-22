import React from 'react'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import './ProposalModal.css'
import { PoiType, ProposalType } from '../../entities/Proposal/types'
import CategoryBanner from '../Category/CategoryBanner'
import locations from '../../modules/locations'

export function POIProposalModal({ ...props }) {
  const t = useFormatMessage()

  return (
    <Modal {...props} size="tiny" className={TokenList.join(['ProposalModal', props.className])} closeIcon={<Close />}>
      <Modal.Content className="ProposalModal__Title">
        <Header>{t('category.poi_title')}</Header>
        <Paragraph small>{t('modal.poi_proposal.description')}</Paragraph>
      </Modal.Content>
      <Modal.Content className="ProposalModal__Actions" style={{ width: '90%' }}>
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
