import React, { useCallback } from 'react'

import classNames from 'classnames'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useClipboardCopy from 'decentraland-gatsby/dist/hooks/useClipboardCopy'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { JOIN_DISCORD_URL } from '../../entities/Proposal/utils'
import Time from '../../utils/date/Time'

import './ProposalModal.css'
import './SuccessModal.css'

export type SuccessModalProps = Omit<ModalProps, 'children'> & {
  onDismiss: (e: React.MouseEvent<unknown>) => void
  loading?: boolean
  linkToCopy?: string
  linkToForum?: string
}

export function SuccessModal({
  title,
  description,
  open,
  onDismiss,
  linkToForum,
  linkToCopy,
  loading,
  ...props
}: SuccessModalProps) {
  const t = useFormatMessage()
  const [copied, state] = useClipboardCopy(Time.Second)
  const handleCopy = useCallback(() => {
    if (linkToCopy) {
      state.copy(linkToCopy)
    }
  }, [linkToCopy, state])

  return (
    <Modal
      {...props}
      open={open}
      size="tiny"
      className={classNames('GovernanceContentModal', 'ProposalModal', 'SuccessModal')}
      closeIcon={<Close />}
    >
      <Modal.Content>
        <div className="ProposalModal__Title">
          <Header>{title}</Header>
          <Paragraph small className="SuccessModal__Description">
            {description}
          </Paragraph>
          <Paragraph small>{t('modal.success.sub')}</Paragraph>
        </div>
        {!!linkToForum && (
          <div className={classNames('SuccessModal__Banner', 'JoinTheDiscussion')}>
            <div className="Description">
              <Paragraph small semiBold>
                {t('modal.success.view_on_forum_title')}
              </Paragraph>
              <Paragraph tiny>{t('modal.success.view_on_forum_description')}</Paragraph>
            </div>
            <Button
              className={classNames('Button', 'JoinTheDiscussion')}
              primary
              size="small"
              href={linkToForum}
              target="_blank"
              rel="noopener noreferrer"
              loading={loading}
            >
              {t('modal.success.view_on_forum_label')}
            </Button>
          </div>
        )}
        <div className={classNames('SuccessModal__Banner', 'Discord')}>
          <div className="Description">
            <Paragraph small semiBold>
              {t('modal.success.join_discord_title')}
            </Paragraph>
            <Paragraph tiny>{t('modal.success.join_discord_description')}</Paragraph>
          </div>
          <Button
            className={classNames('Button', 'Discord')}
            primary
            size="small"
            href={JOIN_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('modal.success.join_discord_label')}
          </Button>
        </div>
        {!!linkToCopy && (
          <div className={classNames('SuccessModal__Banner', 'CopyLink')}>
            <div className="Description">
              <Paragraph small semiBold>
                {t('modal.success.copy_link_title')}
              </Paragraph>
              <Paragraph tiny>{t('modal.success.copy_link_description')}</Paragraph>
            </div>
            <Button
              className={classNames('Button', 'CopyLink')}
              onClick={handleCopy}
              loading={loading}
              primary
              size="small"
            >
              {copied ? t('modal.success.link_copied_label') : t('modal.success.copy_link_label')}
            </Button>
          </div>
        )}
        <div className="ProposalModal__Actions">
          <Button fluid className="SuccessModal__DismissButton" secondary onClick={onDismiss} loading={loading}>
            {t('modal.success.dismiss_button_label')}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}
