import React, { useMemo } from 'react'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { ProposalAttributes, ProposalStatus, ProposalType } from '../../../entities/Proposal/types'
import '../ProposalModal.css'

import './UpdateProposalStatusModal.css'

type UpdateProposalState = {
  proposal: ProposalAttributes | null
  vestingAddress: string
  description: string
}

const initialPollState: UpdateProposalState = {
  proposal: null,
  vestingAddress: '',
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

  function handleAccept(e: React.MouseEvent<unknown>) {
    editor.validate()
    const hasErrors = Object.keys(state.error).length != 0
    if (status && !hasErrors && onClickAccept) {
      onClickAccept(e, status, state.value.vestingAddress ? state.value.vestingAddress : null, state.value.description)
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
      open={open && !!status}
      size="small"
      className={TokenList.join(['ProposalModal', 'UpdateProposalStatusModal', props.className])}
      closeIcon={<Close />}
    >
      <Modal.Content className="ProposalModal__Title">
        <Header>{t('modal.update_status_proposal.title', { status })}</Header>
        <Markdown>{t('modal.update_status_proposal.description', { status }) || ''}</Markdown>
      </Modal.Content>
      {proposal && proposal.type === ProposalType.Grant && (
        <Modal.Content className="ProposalModal__GrantVestingAddress">
          <Label>{t('modal.update_status_proposal.grant_vesting_address')}</Label>
          <Field
            type="address"
            value={state.value.vestingAddress}
            onChange={(_, { value }) => editor.set({ vestingAddress: value }, { validate: false })}
            onBlur={() => editor.set({ vestingAddress: state.value.vestingAddress.trim() })}
            message={t(state.error.vestingAddress)}
            error={!!state.error.vestingAddress}
          />
        </Modal.Content>
      )}
      <Modal.Content className="ProposalModal__Form">
        <Label>{t('modal.update_status_proposal.comments')}</Label>
        <MarkdownTextarea
          minHeight={150}
          value={state.value.description}
          onChange={(_: unknown, { value }: { value: string }) =>
            editor.set({ description: value }, { validate: false })
          }
        />
      </Modal.Content>
      <Modal.Content className="ProposalModal__Actions">
        <Button primary disabled={state.validated} loading={loading && state.validated} onClick={handleAccept}>
          {t(cta)}
        </Button>
        <Button className="cancel" onClick={props.onClose}>
          {t('modal.update_status_proposal.reject')}
        </Button>
      </Modal.Content>
    </Modal>
  )
}
