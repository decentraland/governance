import { useState } from 'react'

import { Governance } from '../../../clients/Governance'
import { Project, ProposalAttributes } from '../../../entities/Proposal/types'
import { isSameAddress } from '../../../entities/Snapshot/utils'
import { ProjectHealth, UpdateAttributes } from '../../../entities/Updates/types'
import { useAuthContext } from '../../../front/context/AuthProvider'
import locations, { navigate } from '../../../utils/locations'
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
  proposal: ProposalAttributes | Project
  update?: UpdateAttributes | null
  expanded: boolean
  index?: number
  onUpdateDeleted?: () => void
  isCoauthor?: boolean
  isLinkable?: boolean
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

const ProposalUpdate = ({
  proposal,
  update,
  expanded,
  index,
  onUpdateDeleted,
  isCoauthor,
  isLinkable = true,
}: Props) => {
  const [isDeletingUpdate, setIsDeletingUpdate] = useState(false)
  const [isDeleteUpdateModalOpen, setIsDeleteUpdateModalOpen] = useState(false)
  const [account] = useAuthContext()

  if (!update) {
    return <EmptyProposalUpdate />
  }

  const handleEditClick = () => navigate(locations.edit.update(update.id))

  const handleDeleteUpdateClick = async () => {
    try {
      setIsDeletingUpdate(true)
      await Governance.get().deleteProposalUpdate(update.id)
      setIsDeleteUpdateModalOpen(false)
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
          isLinkable={isLinkable}
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
