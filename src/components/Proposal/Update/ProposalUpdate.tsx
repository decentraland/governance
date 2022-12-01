import React, { useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'

import { Governance } from '../../../clients/Governance'
import { GrantAttributes, ProposalAttributes } from '../../../entities/Proposal/types'
import { isSameAddress } from '../../../entities/Snapshot/utils'
import { ProjectHealth, UpdateAttributes } from '../../../entities/Updates/types'
import useIsProposalCoAuthor from '../../../hooks/useIsProposalCoAuthor'
import locations from '../../../modules/locations'
import CancelIcon from '../../Icon/Cancel'
import CheckCircleIcon from '../../Icon/CheckCircle'
import QuestionCircleIcon from '../../Icon/QuestionCircle'
import WarningIcon from '../../Icon/Warning'
import { DeleteUpdateModal } from '../../Modal/DeleteUpdateModal/DeleteUpdateModal'

import CollapsedProposalUpdate from './CollapsedProposalUpdate'
import EmptyProposalUpdate from './EmptyProposalUpdate'
import ExpandedProposalUpdate from './ExpandedProposalUpdate'
import './ProposalUpdate.css'

interface Props {
  proposal: ProposalAttributes | GrantAttributes
  update: UpdateAttributes | null
  expanded: boolean
  index?: number
  onUpdateDeleted?: () => void
}

export const getStatusIcon = (
  health: UpdateAttributes['health'],
  completion_date: UpdateAttributes['completion_date']
) => {
  if (!completion_date) {
    return QuestionCircleIcon
  }

  switch (health) {
    case ProjectHealth.OnTrack:
      return CheckCircleIcon
    case ProjectHealth.AtRisk:
      return WarningIcon
    case ProjectHealth.OffTrack:
    default:
      return CancelIcon
  }
}

const ProposalUpdate = ({ proposal, update, expanded, index, onUpdateDeleted }: Props) => {
  const [isDeletingUpdate, setIsDeletingUpdate] = useState(false)
  const [isDeleteUpdateModalOpen, setIsDeleteUpdateModalOpen] = useState(false)
  const [account] = useAuthContext()
  const { isCoauthor } = useIsProposalCoAuthor(proposal)

  if (!update) {
    return <EmptyProposalUpdate />
  }

  const handleEditClick = () => navigate(locations.edit.update(update.id))

  const handleDeleteUpdateClick = async () => {
    try {
      setIsDeletingUpdate(true)
      await Governance.get().deleteProposalUpdate(update)
      if (onUpdateDeleted) {
        onUpdateDeleted()
      }
    } catch (error) {
      console.log('Update delete failed', error)
      setIsDeletingUpdate(false)
    }
  }

  return (
    <>
      {expanded && update?.completion_date ? (
        <ExpandedProposalUpdate
          update={update}
          index={index}
          showMenu={isSameAddress(proposal?.user, account) || isCoauthor}
          onEditClick={handleEditClick}
          onDeleteUpdateClick={() => setIsDeleteUpdateModalOpen(true)}
        />
      ) : (
        <CollapsedProposalUpdate
          onEditClick={handleEditClick}
          onDeleteUpdateClick={() => setIsDeleteUpdateModalOpen(true)}
          proposal={proposal}
          update={update}
          index={index}
          isCoauthor={isCoauthor}
        />
      )}
      <DeleteUpdateModal
        loading={isDeletingUpdate}
        open={isDeleteUpdateModalOpen}
        onClickAccept={handleDeleteUpdateClick}
        onClose={() => setIsDeleteUpdateModalOpen(false)}
      />
    </>
  )
}

export default ProposalUpdate
