import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { GrantTier } from '../../../entities/Grant/GrantTier'
import { ProposalAttributes, ProposalStatus, ProposalType } from '../../../entities/Proposal/types'
import { isValidTransactionHash } from '../../../entities/Proposal/utils'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Field from '../../Common/Form/Field'
import MarkdownField from '../../Common/Form/MarkdownField'
import Label from '../../Common/Typography/Label'
import Markdown from '../../Common/Typography/Markdown'
import '../ProposalModal.css'

import './UpdateProposalStatusModal.css'

type UpdateProposalState = {
  proposal: ProposalAttributes | null
  vestingAddress: string
  enactingTx: string
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
  onClickAccept: (
    status: ProposalStatus,
    vestingContract: string | null,
    enactingTx: string | null,
    description: string
  ) => void
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
  onClickAccept,
  proposal,
  status,
  loading,
  open,
  className,
  ...props
}: Props) {
  const t = useFormatMessage()
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
  } = useForm<UpdateProposalState>({ defaultValues: initialUpdateProposalState, mode: 'onTouched' })
  const isOneTimePaymentProposalTier = GrantTier.isOneTimePaymentTier(proposal?.configuration.tier)

  const onSubmit: SubmitHandler<UpdateProposalState> = async (data) => {
    if (status) {
      onClickAccept(
        status,
        data.vestingAddress ? data.vestingAddress : null,
        data.enactingTx ? data.enactingTx : null,
        data.description
      )
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
