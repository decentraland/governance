import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { forumUrl } from '../../../entities/Proposal/utils'
import Forum from '../../Icon/Forum'

import SidebarLinkButton from './SidebarLinkButton'

export type ForumButtonProps = {
  loading?: boolean
  proposal: ProposalAttributes | null
}

export default React.memo(function ForumButton({ loading, proposal }: ForumButtonProps) {
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
})
