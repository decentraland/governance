import React, { useCallback, useMemo } from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useClipboardCopy from 'decentraland-gatsby/dist/hooks/useClipboardCopy'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { JOIN_DISCORD_URL, forumUrl, proposalUrl } from '../../../entities/Proposal/utils'
import '../ProposalModal.css'

import './FollowUpModal.css'

export type FollowUpModalProps = Omit<ModalProps, 'children'> & {
  onDismiss: (e: React.MouseEvent<unknown>) => void
  proposal?: ProposalAttributes | null
  loading?: boolean
}

export function FollowUpModal({ open, onDismiss, proposal, loading, ...props }: FollowUpModalProps) {
  const t = useFormatMessage()
  const linkToProposal = useMemo(() => (proposal && proposalUrl(proposal)) || '', [proposal])
  const linkToForum = useMemo(() => (proposal && forumUrl(proposal)) || '', [proposal])
  const [copied, state] = useClipboardCopy(Time.Second)

  const handleCopy = useCallback(() => {
    state.copy(linkToProposal)
  }, [linkToProposal, state])

  return (
    <Modal
      {...props}
      open={open}
      size="tiny"
      className={TokenList.join(['ProposalModal', 'FollowUpModal'])}
      closeIcon={<Close />}
    >
      <Modal.Content className="ProposalModal__Title">
        <Header>{t('modal.follow_up.title')}</Header>
        <Paragraph small className="FollowUpModal__Description">
          {t('modal.follow_up.description')}
        </Paragraph>
        <Paragraph small>{t('modal.follow_up.sub')}</Paragraph>
      </Modal.Content>
      <Modal.Content className="FollowUpModal__Form">
        <div className={TokenList.join(['FollowUpModal__Banner', 'JoinTheDiscussion'])}>
          <div className="Description">
            <Paragraph small semiBold>
              {t('modal.follow_up.view_on_forum_title')}
            </Paragraph>
            <Paragraph tiny>{t('modal.follow_up.view_on_forum_description')}</Paragraph>
          </div>
          <Button
            className={TokenList.join(['Button', 'JoinTheDiscussion'])}
            primary
            size="small"
            href={linkToForum}
            target="_blank"
            rel="noopener noreferrer"
            loading={loading}
          >
            {t('modal.follow_up.view_on_forum_label')}
          </Button>
        </div>
        <div className={TokenList.join(['FollowUpModal__Banner', 'Discord'])}>
          <div className="Description">
            <Paragraph small semiBold>
              {t('modal.follow_up.join_discord_title')}
            </Paragraph>
            <Paragraph tiny>{t('modal.follow_up.join_discord_description')}</Paragraph>
          </div>
          <Button
            className={TokenList.join(['Button', 'Discord'])}
            primary
            size="small"
            href={JOIN_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('modal.follow_up.join_discord_label')}
          </Button>
        </div>
        <div className={TokenList.join(['FollowUpModal__Banner', 'CopyLink'])}>
          <div className="Description">
            <Paragraph small semiBold>
              {t('modal.follow_up.copy_link_title')}
            </Paragraph>
            <Paragraph tiny>{t('modal.follow_up.copy_link_description')}</Paragraph>
          </div>
          <Button
            className={TokenList.join(['Button', 'CopyLink'])}
            onClick={handleCopy}
            loading={loading}
            primary
            size="small"
          >
            {copied ? t('modal.follow_up.link_copied_label') : t('modal.follow_up.copy_link_label')}
          </Button>
        </div>
      </Modal.Content>
      <Modal.Content className="ProposalModal__Actions">
        <Button className="FollowUpModal__DismissButton" secondary onClick={onDismiss} loading={loading}>
          {t('modal.follow_up.dismiss_button_label')}
        </Button>
      </Modal.Content>
    </Modal>
  )
}
