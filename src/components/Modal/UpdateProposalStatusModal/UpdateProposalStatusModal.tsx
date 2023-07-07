import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../../../clients/Governance'
import { GrantTier } from '../../../entities/Grant/GrantTier'
import { ProposalAttributes, ProposalStatus, ProposalType } from '../../../entities/Proposal/types'
import { isValidTransactionHash } from '../../../entities/Proposal/utils'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { ProposalPageState } from '../../../pages/proposal'
import Field from '../../Common/Form/Field'
import MarkdownField from '../../Common/Form/MarkdownField'
import Label from '../../Common/Typography/Label'
import Markdown from '../../Common/Typography/Markdown'
import ErrorMessage from '../../Error/ErrorMessage'
import '../ProposalModal.css'

import './UpdateProposalStatusModal.css'

type UpdateProposalState = {
  proposal: ProposalAttributes | null
  vestingAddress: string
  enactingTx: string
  description: string
}

type UpdateProps = {
  status: ProposalStatus
  vesting_contract: string | null
  enactingTx: string | null
  description: string
}

const initialUpdateProposalState: UpdateProposalState = {
  proposal: null,
  vestingAddress: '',
  enactingTx: '',
  description: '',
}

type Props = Omit<ModalProps, 'children'> & {
  proposal?: ProposalAttributes | null
  status?: ProposalStatus | null
  loading?: boolean
  isDAOCommittee: boolean
  updatePageState: (newState: Partial<ProposalPageState>) => void
  proposalKey: string
}

const getPrimaryButtonTextKey = (status?: ProposalStatus | null) => {
  switch (status) {
    case ProposalStatus.Enacted:
      return 'page.proposal_detail.enact'
    case ProposalStatus.Passed:
      return 'page.proposal_detail.pass'
    case ProposalStatus.Rejected:
      return 'page.proposal_detail.reject'
    default:
      return 'modal.update_status_proposal.accept'
  }
}

export function UpdateProposalStatusModal({
  proposal,
  isDAOCommittee,
  status,
  loading,
  open,
  updatePageState,
  proposalKey,
  className,
  ...props
}: Props) {
  const t = useFormatMessage()
  const isOneTimePaymentProposalTier = GrantTier.isOneTimePaymentTier(proposal?.configuration.tier)
  const queryClient = useQueryClient()

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
  } = useForm<UpdateProposalState>({ defaultValues: initialUpdateProposalState, mode: 'onTouched' })

  const [error, setError] = useState('')

  const { mutate: updateProposal } = useMutation({
    mutationFn: async (updateProps: UpdateProps) => {
      const { status, vesting_contract, enactingTx, description } = updateProps
      if (proposal && isDAOCommittee) {
        try {
          const updateProposal = await Governance.get().updateProposalStatus(
            proposal.id,
            status,
            vesting_contract,
            enactingTx,
            description
          )
          updatePageState({ confirmStatusUpdate: false })
          return updateProposal
        } catch (err: any) {
          console.error(err, { ...err })
          setError(err.body?.error || err.message)
        }
      }
    },
    onSuccess: (proposal) => {
      if (proposal) {
        queryClient.setQueryData([proposalKey], proposal)
      }
    },
    mutationKey: ['updatingProposal'],
  })

  const onSubmit: SubmitHandler<UpdateProposalState> = async (data) => {
    if (status) {
      updateProposal({
        status,
        vesting_contract: data.vestingAddress ? data.vestingAddress : null,
        enactingTx: data.enactingTx ? data.enactingTx : null,
        description: data.description,
      })
    }
  }

  return (
    <Modal
      {...props}
      open={open && !!status}
      size="small"
      className={classNames('GovernanceActionModal', 'ProposalModal', 'UpdateProposalStatusModal', className)}
      closeIcon={<Close />}
    >
      <Modal.Content>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="ProposalModal__Title">
            <Header>{t('modal.update_status_proposal.title', { status })}</Header>
            <Markdown size="lg">{t('modal.update_status_proposal.description', { status }) || ''}</Markdown>
          </div>

          {proposal && proposal.type === ProposalType.Grant && (
            <div className="ProposalModal__GrantTransaction">
              {!isOneTimePaymentProposalTier && (
                <>
                  <Label>{t('modal.update_status_proposal.grant_vesting_address')}</Label>
                  <Field
                    control={control}
                    name="vestingAddress"
                    type="address"
                    message={errors.vestingAddress?.message}
                    error={!!errors.vestingAddress}
                    rules={{
                      validate: (value: string) => {
                        if (!isEthereumAddress(value)) {
                          return t('error.update_status_proposal.grant_vesting_address_invalid')
                        }
                      },
                    }}
                  />
                </>
              )}
              {isOneTimePaymentProposalTier && (
                <>
                  <Label>{t('modal.update_status_proposal.grant_enacting_tx')}</Label>
                  <Field
                    control={control}
                    name="enactingTx"
                    type="address"
                    message={errors.enactingTx?.message}
                    error={!!errors.enactingTx}
                    rules={{
                      validate: (value: string) => {
                        if (!isValidTransactionHash(value)) {
                          return t('error.update_status_proposal.grant_enacting_tx_invalid')
                        }
                      },
                    }}
                  />
                </>
              )}
            </div>
          )}
          <div className="ProposalModal__Form">
            <Label>{t('modal.update_status_proposal.comments')}</Label>
            <MarkdownField control={control} name="description" />
          </div>
          <div className="ProposalModal__Actions">
            {error && (
              <ErrorMessage
                className="ProposalModal__ErrorMessage"
                label={t('modal.update_status_proposal.update_error_label')}
                errorMessage={t(error) || error}
                verticalHeader
              />
            )}
            <Button type="submit" primary fluid disabled={isSubmitting} loading={loading && isSubmitting}>
              {t(getPrimaryButtonTextKey(status))}
            </Button>
            <Button
              className="cancel"
              fluid
              onClick={(e) => {
                e.preventDefault()
                props.onClose()
              }}
            >
              {t('modal.update_status_proposal.reject')}
            </Button>
          </div>
        </form>
      </Modal.Content>
    </Modal>
  )
}
