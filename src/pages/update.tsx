import React, { useMemo, useState } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link, navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { Governance } from '../clients/Governance'
import ContentLayout, { ContentSection } from '../components/Layout/ContentLayout'
import LoadingView from '../components/Layout/LoadingView'
import { DeleteUpdateModal } from '../components/Modal/DeleteUpdateModal/DeleteUpdateModal'
import UpdateMarkdownView from '../components/Updates/UpdateMarkdownView'
import { CoauthorStatus } from '../entities/Coauthor/types'
import useCoAuthorsByProposal from '../hooks/useCoAuthorsByProposal'
import useProposal from '../hooks/useProposal'
import useProposalUpdate from '../hooks/useProposalUpdate'
import useProposalUpdates from '../hooks/useProposalUpdates'
import locations from '../modules/locations'

import './update.css'

export default function UpdateDetail() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const updateId = params.get('id')
  const { update, state: updateState } = useProposalUpdate(updateId)
  const [proposal, proposalState] = useProposal(update?.proposal_id)
  const { publicUpdates, state: updatesState } = useProposalUpdates(update?.proposal_id)
  const [isDeletingUpdate, setIsDeletingUpdate] = useState(false)
  const [isDeleteUpdateModalOpen, setIsDeleteUpdateModalOpen] = useState(false)
  const [account] = useAuthContext()
  const isCoauthor = !!useCoAuthorsByProposal(proposal).find(
    (coauthor) =>
      coauthor.address?.toLowerCase() === account?.toLowerCase() && coauthor.status === CoauthorStatus.APPROVED
  )
  const isAuthorOrCoauthor = account?.toLowerCase() === update?.author?.toLowerCase() || isCoauthor

  if (updateState.error || proposalState.error || updatesState.error) {
    return (
      <ContentLayout>
        <NotFound />
      </ContentLayout>
    )
  }

  if (!update || updateState.loading || updatesState.loading || proposalState.loading) {
    return <LoadingView />
  }

  const handleDeleteUpdateClick = async () => {
    try {
      setIsDeletingUpdate(true)
      await Governance.get().deleteProposalUpdate(update)
      navigate(locations.proposal(update.proposal_id))
    } catch (error) {
      console.log('Update delete failed', error)
      setIsDeletingUpdate(false)
    }
  }

  const index = publicUpdates && publicUpdates.length - Number(publicUpdates?.findIndex((item) => item.id === updateId))
  const proposalHref = locations.proposal(update.proposal_id)

  return (
    <ContentLayout navigateHref={proposalHref} small>
      <ContentSection className="UpdateDetail__Header">
        <span className="UpdateDetail__ProjectTitle">
          {t('page.update_detail.project_title', { title: <Link href={proposalHref}>{proposal?.title}</Link> })}
        </span>
        <Header size="huge">{t('page.update_detail.title', { index })}</Header>
      </ContentSection>
      {update && <UpdateMarkdownView update={update} author={update.author} />}
      {isAuthorOrCoauthor && (
        <Button
          className="UpdateDetail__DeleteUpdate"
          basic
          onClick={() => setIsDeleteUpdateModalOpen(true)}
          loading={isDeletingUpdate}
          disabled={isDeletingUpdate}
        >
          {t('page.update_detail.delete_update')}
        </Button>
      )}

      <DeleteUpdateModal
        loading={isDeletingUpdate}
        open={isDeleteUpdateModalOpen}
        onClickAccept={handleDeleteUpdateClick}
        onClose={() => setIsDeleteUpdateModalOpen(false)}
      />
    </ContentLayout>
  )
}
