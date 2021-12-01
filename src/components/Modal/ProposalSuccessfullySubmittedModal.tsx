import React from 'react'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './ProposalModal.css'
import './ProposalSuccessfullySubmittedModal.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

export function ProposalSuccessfullySubmittedModal() {
  const l = useFormatMessage()

  return <Modal open={true} size="tiny" className={TokenList.join(['ProposalModal', 'ProposalSuccessfullySubmittedModal'])} closeIcon={<Close />}>
    <Modal.Content className="ProposalModal__Title">
      <Header>{l('modal.successfully_submitted.title')}</Header>
      <Paragraph small className="ProposalSuccessfullySubmittedModal__Description">
        {l('modal.successfully_submitted.description')}
      </Paragraph>
      <Paragraph small>{l('modal.successfully_submitted.sub')}</Paragraph>
    </Modal.Content>
    <Modal.Content className="ProposalSuccessfullySubmittedModal__Form">
      <a className={TokenList.join(['ProposalSuccessfullySubmittedModal__Banner', 'JoinTheDiscussion'])}>
        <div className="Description">
          <Paragraph small semiBold>{l('modal.successfully_submitted.view_on_forum_title')}</Paragraph>
          <Paragraph tiny>{l('modal.successfully_submitted.view_on_forum_description')}</Paragraph>
        </div>
        <Button className={TokenList.join(['Button', 'JoinTheDiscussion'])}  primary size="small" >
          {l('modal.successfully_submitted.view_on_forum_label')}
        </Button>
      </a>
      <a className={TokenList.join(['ProposalSuccessfullySubmittedModal__Banner', 'Discord'])}>
        <div className="Description">
          <Paragraph small semiBold>{l('modal.successfully_submitted.join_discord_title')}</Paragraph>
          <Paragraph tiny>{l('modal.successfully_submitted.join_discord_description')}</Paragraph>
        </div>
        <Button className={TokenList.join(['Button', 'Discord'])} primary size="small" >
          {l('modal.successfully_submitted.join_discord_label')}
        </Button>
      </a>
      <a className={TokenList.join(['ProposalSuccessfullySubmittedModal__Banner', 'CopyLink'])}>
        <div className="Description">
          <Paragraph small semiBold>{l('modal.successfully_submitted.copy_link_title')}</Paragraph>
          <Paragraph tiny>{l('modal.successfully_submitted.copy_link_description')}</Paragraph>
        </div>
        <Button className={TokenList.join(['Button', 'CopyLink'])}  primary size="small" >
          {l('modal.successfully_submitted.copy_link_label')}
        </Button>
      </a>
    </Modal.Content>
    <Modal.Content className="ProposalModal__Actions">
      <Button className="ProposalSuccessfullySubmittedModal__DismissButton" secondary onClick={() => 0}>{l('modal.successfully_submitted.dismiss_button_label')}</Button>
    </Modal.Content>
  </Modal>
}
