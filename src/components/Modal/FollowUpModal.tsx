import React from 'react'
import { Modal, ModalProps} from 'decentraland-ui/dist/components/Modal/Modal'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './ProposalModal.css'
import './FollowUpModal.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'


export type FollowUpModalProps = Omit<ModalProps, 'children'> & {
}

export function FollowUpModal({ open, ...props }: FollowUpModalProps) {
  const l = useFormatMessage()

  return <Modal open={open} size="tiny" className={TokenList.join(['ProposalModal', 'FollowUpModal'])} closeIcon={<Close />}>
    <Modal.Content className="ProposalModal__Title">
      <Header>{l('modal.follow_up.title')}</Header>
      <Paragraph small className="FollowUpModal__Description">
        {l('modal.follow_up.description')}
      </Paragraph>
      <Paragraph small>{l('modal.follow_up.sub')}</Paragraph>
    </Modal.Content>
    <Modal.Content className="FollowUpModal__Form">
      <a className={TokenList.join(['FollowUpModal__Banner', 'JoinTheDiscussion'])}>
        <div className="Description">
          <Paragraph small semiBold>{l('modal.follow_up.view_on_forum_title')}</Paragraph>
          <Paragraph tiny>{l('modal.follow_up.view_on_forum_description')}</Paragraph>
        </div>
        <Button className={TokenList.join(['Button', 'JoinTheDiscussion'])}  primary size="small" >
          {l('modal.follow_up.view_on_forum_label')}
        </Button>
      </a>
      <a className={TokenList.join(['FollowUpModal__Banner', 'Discord'])}>
        <div className="Description">
          <Paragraph small semiBold>{l('modal.follow_up.join_discord_title')}</Paragraph>
          <Paragraph tiny>{l('modal.follow_up.join_discord_description')}</Paragraph>
        </div>
        <Button className={TokenList.join(['Button', 'Discord'])} primary size="small" >
          {l('modal.follow_up.join_discord_label')}
        </Button>
      </a>
      <a className={TokenList.join(['FollowUpModal__Banner', 'CopyLink'])}>
        <div className="Description">
          <Paragraph small semiBold>{l('modal.follow_up.copy_link_title')}</Paragraph>
          <Paragraph tiny>{l('modal.follow_up.copy_link_description')}</Paragraph>
        </div>
        <Button className={TokenList.join(['Button', 'CopyLink'])}  primary size="small" >
          {l('modal.follow_up.copy_link_label')}
        </Button>
      </a>
    </Modal.Content>
    <Modal.Content className="ProposalModal__Actions">
      <Button className="FollowUpModal__DismissButton" secondary onClick={() => 0}>{l('modal.follow_up.dismiss_button_label')}</Button>
    </Modal.Content>
  </Modal>
}
