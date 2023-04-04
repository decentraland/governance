import React from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { HiringType, PoiType } from '../../../entities/Proposal/types'
import CategoryBanner from '../../Category/CategoryBanner'
import '../ProposalModal.css'

export type AddDeleteProposalModalProps = ModalProps & {
  title: 'poi' | 'hiring'
  addType: PoiType | HiringType
  addHref: string
  removeType: PoiType | HiringType
  removeHref: string
}

export function AddDeleteProposalModal({
  title,
  addType,
  addHref,
  removeType,
  removeHref,
  ...props
}: AddDeleteProposalModalProps) {
  const t = useFormatMessage()

  return (
    <Modal {...props} size="tiny" className="GovernanceContentModal ProposalModal" closeIcon={<Close />}>
      <Modal.Content>
        <div className="ProposalModal__Title">
          <Header>{t(`category.${title}_title`)}</Header>
          <Paragraph small>{t('modal.poi_proposal.description')}</Paragraph>
        </div>
      </Modal.Content>
      <div className="ProposalModel__Actions">
        <CategoryBanner type={addType} href={addHref} />
        <CategoryBanner type={removeType} href={removeHref} />
      </div>
    </Modal>
  )
}
