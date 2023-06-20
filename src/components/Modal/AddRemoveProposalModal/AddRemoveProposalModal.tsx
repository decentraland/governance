import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { HiringType, PoiType } from '../../../entities/Proposal/types'
import CategoryBanner from '../../Category/CategoryBanner'
import Text from '../../Common/Text/Text'
import '../ProposalModal.css'

export type AddRemoveProposalModalProps = ModalProps & {
  title: 'poi' | 'hiring'
  addType: PoiType | HiringType
  addHref: string
  isAddDisabled?: boolean
  removeType: PoiType | HiringType
  removeHref: string
  isRemoveDisabled?: boolean
}

export function AddRemoveProposalModal({
  title,
  addType,
  addHref,
  isAddDisabled,
  removeType,
  removeHref,
  isRemoveDisabled,
  ...props
}: AddRemoveProposalModalProps) {
  const t = useFormatMessage()

  return (
    <Modal {...props} size="tiny" className="GovernanceContentModal ProposalModal" closeIcon={<Close />}>
      <Modal.Content>
        <div className="ProposalModal__Title">
          <Header>{t(`category.${title}_title`)}</Header>
          <Text size="lg">{t('modal.poi_proposal.description')}</Text>
        </div>
      </Modal.Content>
      <div className="ProposalModel__Actions">
        <CategoryBanner type={addType} href={addHref} active={!isAddDisabled} />
        <CategoryBanner type={removeType} href={removeHref} active={!isRemoveDisabled} />
      </div>
    </Modal>
  )
}
