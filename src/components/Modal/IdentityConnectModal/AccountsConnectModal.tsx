import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import ActionCard, { ActionCardProps } from '../../ActionCard/ActionCard'
import Discourse from '../../Icon/Discourse'

import './AccountsConnectModal.css'

const CARDS: ActionCardProps[] = [
  {
    title: 'modal.identity_setup.forum.card_title',
    description: 'modal.identity_setup.forum.card_description',
    icon: <Discourse />,
    onCardClick: () => ({}),
  },
  {
    title: 'modal.identity_setup.discord.card_title',
    description: 'modal.identity_setup.discord.card_description',
    icon: <Discourse />,
  },
  {
    title: 'modal.identity_setup.twitter.card_title',
    description: 'modal.identity_setup.twitter.card_description',
    icon: <Discourse />,
  },
]

function AccountsConnectModal({ open, onClose }: ModalProps) {
  const t = useFormatMessage()
  return (
    <Modal open={open} className="AccountsConnectModal" size="tiny" onClose={onClose} closeIcon={<Close />}>
      <Modal.Header className="AccountsConnectModal__Header">{t('modal.identity_setup.title')}</Modal.Header>
      <Modal.Content>
        {CARDS.map((cardProps, index) => {
          const { title, description } = cardProps
          return (
            <ActionCard key={`ActionCard--${index}`} {...cardProps} title={t(title)} description={t(description)} />
          )
        })}
      </Modal.Content>
    </Modal>
  )
}

export default AccountsConnectModal
