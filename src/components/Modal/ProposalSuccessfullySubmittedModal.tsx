import React from 'react'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './ProposalModal.css'
import './ProposalSuccessfullySubmittedModal.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'

export function ProposalSuccessfullySubmittedModal() {
  return <Modal open={true} size="tiny" className={TokenList.join(['ProposalModal', 'ProposalSuccessfullySubmittedModal'])} closeIcon={<Close />}>
    <Modal.Content className="ProposalModal__Title">
      <Header>Proposal successfully submitted</Header>
      <Paragraph small className="ProposalSuccessfullySubmittedModal__Description">
        Thanks for taking part in the DAO
      </Paragraph>
      <Paragraph small>Here's what you could do next</Paragraph>
    </Modal.Content>
    <Modal.Content className="ProposalSuccessfullySubmittedModal__Form">
      <a className={TokenList.join(['ProposalSuccessfullySubmittedModal__Banner', 'JoinTheDiscussion'])}>
        <div className="Description">
          <Paragraph small semiBold>Join the discussion</Paragraph>
          <Paragraph tiny>Comment, ideate, expand.</Paragraph>
        </div>
        <Button className={TokenList.join(['Button', 'JoinTheDiscussion'])}  primary size="small" >
          View on forum
        </Button>
      </a>
      <a className={TokenList.join(['ProposalSuccessfullySubmittedModal__Banner', 'Discord'])}>
        <div className="Description">
          <Paragraph small semiBold>Visualize on Discord</Paragraph>
          <Paragraph tiny>Our #dao channel is just for that</Paragraph>
        </div>
        <Button className={TokenList.join(['Button', 'Discord'])} primary size="small" >
          Join Discord
        </Button>
      </a>
      <a className={TokenList.join(['ProposalSuccessfullySubmittedModal__Banner', 'CopyLink'])}>
        <div className="Description">
          <Paragraph small semiBold>Keep this at hand</Paragraph>
          <Paragraph tiny>Come back later to check progress</Paragraph>
        </div>
        <Button className={TokenList.join(['Button', 'CopyLink'])}  primary size="small" >
          Copy Link
        </Button>
      </a>
    </Modal.Content>
  </Modal>
}
