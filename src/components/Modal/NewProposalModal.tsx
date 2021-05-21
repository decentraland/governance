import React from 'react'
import { Modal, ModalProps} from 'decentraland-ui/dist/components/Modal/Modal'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import locations from '../../modules/locations'
import { ProposalType } from '../../entities/Proposal/types'
import CategoryBanner from '../Category/CategoryBanner'
import './NewProposalModal.css'

export function NewProposalModal(props: Omit<ModalProps, 'children'>) {
  const l = useFormatMessage()

  return <Modal {...props} size="tiny" className={TokenList.join(['NewProposalModal', props.className])} closeIcon={<Close />}>
    <Modal.Content className="NewProposalModal__Title">
      <Header>{l('modal.new_proposal.title')}</Header>
      <Paragraph small>{l('modal.new_proposal.description')}</Paragraph>
    </Modal.Content>
    <Modal.Content>
      <CategoryBanner type={ProposalType.Catalyst} href={locations.submit(ProposalType.Catalyst)} active />
      <CategoryBanner type={ProposalType.POI} href={locations.submit(ProposalType.POI)} active />
      <CategoryBanner type={ProposalType.BanName} href={locations.submit(ProposalType.BanName)} active />
      {/* <CategoryBanner type={ProposalType.Grant} href={locations.submit(ProposalType.Grant)} active /> */}
      <CategoryBanner type={ProposalType.Poll} href={locations.submit(ProposalType.Poll)} active />
    </Modal.Content>
  </Modal>
}