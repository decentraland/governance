import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import usePaginatedProposals from '../../hooks/usePaginatedProposals'
import FullWidthButton from '../Common/FullWidthButton'

import ProposalCreatedItem from './ProposalCreatedItem'

const MyProposalsTab = () => {
  const [account] = useAuthContext()
  const t = useFormatMessage()

  const { proposals, hasMoreProposals, loadMore } = usePaginatedProposals({
    load: !!account,
    ...(!!account && { user: account }),
  })

  return (
    <>
      {proposals.map((proposal) => (
        <ProposalCreatedItem key={proposal.id} proposal={proposal} />
      ))}
      {hasMoreProposals && (
        <FullWidthButton onClick={loadMore}>{t('page.profile.created_proposals.button')}</FullWidthButton>
      )}
    </>
  )
}

export default MyProposalsTab
