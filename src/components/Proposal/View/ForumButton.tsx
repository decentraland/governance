import React from 'react'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { forumUrl } from '../../../entities/Proposal/utils'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Forum from '../../Icon/Forum'

import SidebarLinkButton from './SidebarLinkButton'

type ForumButtonProps = {
  loading?: boolean
  proposal: Pick<ProposalAttributes, 'discourse_topic_id' | 'discourse_topic_slug'> | null
}

export default function ForumButton({ loading, proposal }: ForumButtonProps) {
  const t = useFormatMessage()
  return (
    <SidebarLinkButton
      loading={loading}
      disabled={!proposal}
      href={(proposal && forumUrl(proposal)) || ''}
      icon={<Forum size={20} />}
    >
      {t('page.proposal_detail.forum_button')}
    </SidebarLinkButton>
  )
}
