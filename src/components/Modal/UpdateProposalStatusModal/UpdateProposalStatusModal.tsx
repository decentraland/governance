import React, { useMemo } from 'react'

import classNames from 'classnames'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { GrantTier } from '../../../entities/Grant/GrantTier'
import { ProposalAttributes, ProposalStatus, ProposalType } from '../../../entities/Proposal/types'
import { isValidTransactionHash } from '../../../entities/Proposal/utils'
import Label from '../../Common/Label'
import Markdown from '../../Common/Markdown/Markdown'
import '../ProposalModal.css'

import './UpdateProposalStatusModal.css'

type UpdateProposalState = {
  proposal: ProposalAttributes | null
  vestingAddress: string
  enactingTx: string
  description: string
}

const initialPollState: UpdateProposalState = {
  proposal: null,
  vestingAddress: '',
  enactingTx: '',
  description: '',
}

const edit = (state: UpdateProposalState, props: Partial<UpdateProposalState>) => {
  return {
    ...state,
    ...props,
  }
}

const validate = createValidator<UpdateProposalState>({
  vestingAddress: (state) => ({
    vestingAddress: assert(
      !state.vestingAddress || isEthereumAddress(state.vestingAddress),
      'error.update_status_proposal.grant_vesting_address_invalid'
    ),
  }),
  enactingTx: (state) => ({
    enactingTx: assert(
      !state.enactingTx || isValidTransactionHash(state.enactingTx),
      'error.update_status_proposal.grant_enacting_tx_invalid'
    ),
  }),
  description: () => ({
    description: undefined,
  }),
})

export type UpdateProposalStatusModalProps = Omit<ModalProps, 'children'> & {
  proposal?: ProposalAttributes | null
  status?: ProposalStatus | null
  loading?: boolean
  onClickAccept?: (
    e: React.MouseEvent<unknown>,
    status: ProposalStatus,
    vestingContract: string | null,
    enactingTx: string | null,
    description: string
  ) => void
}

export function UpdateProposalStatusModal({
  onClickAccept,
  proposal,
  status,
  loading,
  open,
  ...props
}: UpdateProposalStatusModalProps) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, initialPollState)
  const isOneTimePaymentProposalTier = GrantTier.isOneTimePaymentTier(proposal?.configuration.tier)

  function handleAccept(e: React.MouseEvent<unknown>) {
    editor.validate()
    const hasErrors = Object.keys(state.error).length != 0
    if (status && !hasErrors && onClickAccept) {
      onClickAccept(
        e,
        status,
        state.value.vestingAddress ? state.value.vestingAddress : null,
        state.value.enactingTx ? state.value.enactingTx : null,
        state.value.description
      )
    }
  }

  const cta = useMemo(() => {
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
  }, [status])

  return (
    <Modal
      {...props}
      open={true}
      size="small"
      className={classNames('GovernanceActionModal', 'ProposalModal', 'UpdateProposalStatusModal', props.className)}
      closeIcon={<Close />}
    >
      <Modal.Content>
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
                  type="address"
                  value={state.value.vestingAddress}
                  onChange={(_, { value }) => editor.set({ vestingAddress: value }, { validate: false })}
                  onBlur={() => editor.set({ vestingAddress: state.value.vestingAddress.trim() })}
                  message={t(state.error.vestingAddress)}
                  error={!!state.error.vestingAddress}
                />
              </>
            )}
            {isOneTimePaymentProposalTier && (
              <>
                <Label>{t('modal.update_status_proposal.grant_enacting_tx')}</Label>
                <Field
                  type="address"
                  value={state.value.enactingTx}
                  onChange={(_, { value }) => editor.set({ enactingTx: value }, { validate: false })}
                  onBlur={() => editor.set({ enactingTx: state.value.enactingTx.trim() })}
                  message={t(state.error.enactingTx)}
                  error={!!state.error.enactingTx}
                />
              </>
            )}
          </div>
        )}
        <div className="ProposalModal__Form">
          <Label>{t('modal.update_status_proposal.comments')}</Label>
          <MarkdownTextarea
            minHeight={150}
            value={state.value.description}
            onChange={(_: unknown, { value }: { value: string }) =>
              editor.set({ description: value }, { validate: false })
            }
          />
        </div>
        <div className="ProposalModal__Actions">
          <Button primary fluid disabled={state.validated} loading={loading && state.validated} onClick={handleAccept}>
            {t(cta)}
          </Button>
          <Button className="cancel" fluid onClick={props.onClose}>
            {t('modal.update_status_proposal.reject')}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}
