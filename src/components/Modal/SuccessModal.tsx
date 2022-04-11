import React, { useCallback } from 'react'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import useClipboardCopy from 'decentraland-gatsby/dist/hooks/useClipboardCopy'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { JOIN_DISCORD_URL } from '../../entities/Proposal/utils'
import './ProposalModal.css'
import './SuccessModal.css'

export type SuccessModalProps = Omit<ModalProps, 'children'> & {
  onDismiss: (e: React.MouseEvent<any>) => void
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
  }, [state.copy, linkToCopy])

  return (
    <Modal
      {...props}
      open={open}
      size="tiny"
      className={TokenList.join(['ProposalModal', 'SuccessModal'])}
      closeIcon={<Close />}
    >
      <Modal.Content className="ProposalModal__Title">
        <Header>{title}</Header>
        <Paragraph small className="SuccessModal__Description">
          {description}
        </Paragraph>
        <Paragraph small>{t('modal.success.sub')}</Paragraph>
      </Modal.Content>
      <Modal.Content>
        {!!linkToForum && (
          <div className={TokenList.join(['SuccessModal__Banner', 'JoinTheDiscussion'])}>
            <div className="Description">
              <Paragraph small semiBold>
                {t('modal.success.view_on_forum_title')}
              </Paragraph>
              <Paragraph tiny>{t('modal.success.view_on_forum_description')}</Paragraph>
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
              {t('modal.success.view_on_forum_label')}
            </Button>
          </div>
        )}
        <div className={TokenList.join(['SuccessModal__Banner', 'Discord'])}>
          <div className="Description">
            <Paragraph small semiBold>
              {t('modal.success.join_discord_title')}
            </Paragraph>
            <Paragraph tiny>{t('modal.success.join_discord_description')}</Paragraph>
          </div>
          <Button
            className={TokenList.join(['Button', 'Discord'])}
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
          <div className={TokenList.join(['SuccessModal__Banner', 'CopyLink'])}>
            <div className="Description">
              <Paragraph small semiBold>
                {t('modal.success.copy_link_title')}
              </Paragraph>
              <Paragraph tiny>{t('modal.success.copy_link_description')}</Paragraph>
            </div>
            <Button
              className={TokenList.join(['Button', 'CopyLink'])}
              onClick={handleCopy}
              loading={loading}
              primary
              size="small"
            >
              {copied ? t('modal.success.link_copied_label') : t('modal.success.copy_link_label')}
            </Button>
          </div>
        )}
      </Modal.Content>
      <Modal.Content className="ProposalModal__Actions">
        <Button className="SuccessModal__DismissButton" secondary onClick={onDismiss} loading={loading}>
          {t('modal.success.dismiss_button_label')}
        </Button>
      </Modal.Content>
    </Modal>
  )
}
