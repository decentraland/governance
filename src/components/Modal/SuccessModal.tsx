import React, { useCallback } from 'react'

import classNames from 'classnames'
import useClipboardCopy from 'decentraland-gatsby/dist/hooks/useClipboardCopy'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { JOIN_DISCORD_URL } from '../../entities/Proposal/utils'
import Time from '../../utils/date/Time'
import Text from '../Common/Text/Text'

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
          <Text size="lg" className="SuccessModal__Description">
            {description}
          </Text>
          <Text size="lg">{t('modal.success.sub')}</Text>
        </div>
        {!!linkToCopy && (
          <div className={classNames('SuccessModal__Banner', 'JoinTheDiscussion')}>
            <div className="Description">
              <Text size="lg" weight="semi-bold" className="SuccessModal__BannerTitle">
                {t('modal.success.view_on_forum_title')}
              </Text>
              <Text size="md">{t('modal.success.view_on_forum_description')}</Text>
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
            <Text size="lg" weight="semi-bold" className="SuccessModal__BannerTitle">
              {t('modal.success.join_discord_title')}
            </Text>
            <Text size="md">{t('modal.success.join_discord_description')}</Text>
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
              <Text size="lg" weight="semi-bold" className="SuccessModal__BannerTitle">
                {t('modal.success.copy_link_title')}
              </Text>
              <Text size="md">{t('modal.success.copy_link_description')}</Text>
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
