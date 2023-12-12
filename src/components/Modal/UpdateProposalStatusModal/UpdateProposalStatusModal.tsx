import { useEffect, useMemo, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Field as DCLField } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../../../clients/Governance'
import { ProposalAttributes, ProposalStatus, ProposalType } from '../../../entities/Proposal/types'
import { validateUniqueAddresses } from '../../../entities/Transparency/utils'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Label from '../../Common/Typography/Label'
import Markdown from '../../Common/Typography/Markdown'
import ErrorMessage from '../../Error/ErrorMessage'
import '../ProposalModal.css'

import './UpdateProposalStatusModal.css'

type UpdateProposalState = {
  vestingAddresses: string[]
}

type UpdateData = {
  status: ProposalStatus
  vestingContracts: string[]
}

type Props = Omit<ModalProps, 'children'> & {
  proposal: ProposalAttributes | null
  status: ProposalStatus | null
  loading?: boolean
  isDAOCommittee: boolean
  proposalKey: string
}

const getPrimaryButtonTextKey = (status: ProposalStatus | null, isEdit: boolean) => {
  switch (status) {
    case ProposalStatus.Enacted:
      return isEdit ? 'page.proposal_detail.edit_enacted_data' : 'page.proposal_detail.enact'
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
  proposalKey,
  className,
  ...props
}: Props) {
  const t = useFormatMessage()
  const queryClient = useQueryClient()
  const { vesting_addresses } = proposal || {}
  const defaultValues = useMemo(
    () => ({ vestingAddresses: vesting_addresses && vesting_addresses.length > 0 ? vesting_addresses : [''] }),
    [vesting_addresses]
  )

  const { handleSubmit, control, setValue, reset } = useForm<UpdateProposalState>({
    defaultValues,
    mode: 'onTouched',
  })

  const onClose = () => {
    setError('')
    reset(defaultValues)
    props.onClose()
  }

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const values = useWatch({ control })

  const isGrantProposal = proposal?.type === ProposalType.Grant
  const showAddButton = isGrantProposal && !!vesting_addresses && vesting_addresses.length > 0
  const hasValues = values.vestingAddresses && values.vestingAddresses.filter((value) => value.length > 0).length > 0

  useEffect(() => {
    setValue('vestingAddresses', defaultValues.vestingAddresses)
  }, [defaultValues, setValue])

  const handleRemoveOption = (idx: number) => {
    const newOptions = [...(values.vestingAddresses || [])]
    newOptions.splice(idx, 1)
    if (newOptions.length === 0) {
      newOptions.push('')
    }
    setValue('vestingAddresses', newOptions)
  }

  const handleAddOption = () => {
    const newOptions = [...(values.vestingAddresses || [])]
    newOptions.push('')
    setValue('vestingAddresses', newOptions)
  }

  const handleEditOption = (idx: number, value: string) => {
    const newOptions = [...(values.vestingAddresses || [])]
    newOptions[idx] = value
    setValue('vestingAddresses', newOptions)
  }

  const { mutate: updateProposal } = useMutation({
    mutationFn: async (updateData: UpdateData) => {
      setIsSubmitting(true)
      const { status, vestingContracts } = updateData
      const filteredVestingContracts = vestingContracts.filter((address) => address.length > 0)
      if (!validateUniqueAddresses(filteredVestingContracts)) {
        setError('modal.update_status_proposal.duplicated_vesting_address')
        setIsSubmitting(false)
        return
      }
      if (proposal && isDAOCommittee) {
        if (filteredVestingContracts.some((address) => !isEthereumAddress(address))) {
          setError('modal.update_status_proposal.invalid_vesting_address')
          setIsSubmitting(false)
          return
        }
        setError('')
        try {
          const updateProposal = await Governance.get().updateProposalStatus(
            proposal.id,
            status,
            isGrantProposal ? filteredVestingContracts : undefined
          )
          onClose()
          return updateProposal
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          setIsSubmitting(false)
          setError(err.body?.error || err.message)
        }
      }
    },
    onSuccess: (proposal) => {
      setIsSubmitting(false)
      if (proposal) {
        queryClient.setQueryData([proposalKey], proposal)
        queryClient.invalidateQueries([`proposalUpdates#${proposal.id}`])
      }
    },
    mutationKey: [`updatingProposal#${proposal?.id}`],
  })

  const onSubmit: SubmitHandler<UpdateProposalState> = async (data) => {
    if (status) {
      await updateProposal({
        status,
        vestingContracts: data.vestingAddresses,
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
      onClose={onClose}
    >
      <Modal.Content>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="ProposalModal__Title">
            <Header>{t('modal.update_status_proposal.title', { status })}</Header>
            <Markdown size="lg">{t('modal.update_status_proposal.description', { status }) || ''}</Markdown>
          </div>

          {proposal && isGrantProposal && (
            <div className="ProposalModal__GrantTransaction">
              <Label>{t('modal.update_status_proposal.grant_vesting_addresses')}</Label>
              {values.vestingAddresses?.map((address, idx) => (
                <DCLField
                  key={`contract-${idx}`}
                  placeholder="0x..."
                  value={address}
                  action={<Icon name="x" />}
                  onAction={(e) => {
                    e.preventDefault()
                    handleRemoveOption(idx)
                  }}
                  onChange={(_, { value }) => handleEditOption(idx, value)}
                  disabled={isSubmitting}
                />
              ))}
              {showAddButton && (
                <Button
                  basic
                  fluid
                  onClick={(e) => {
                    e.preventDefault()
                    handleAddOption()
                  }}
                >
                  {t('modal.update_status_proposal.add_vesting_contract')}
                </Button>
              )}
            </div>
          )}
          <div className="ProposalModal__Actions">
            {error && (
              <ErrorMessage
                className="ProposalModal__ErrorMessage"
                label={t('modal.update_status_proposal.update_error_label')}
                errorMessage={t(error) || error}
                verticalHeader
              />
            )}
            <Button
              type="submit"
              primary
              fluid
              disabled={isSubmitting || (isGrantProposal && !hasValues)}
              loading={loading && isSubmitting}
            >
              {t(getPrimaryButtonTextKey(status, showAddButton))}
            </Button>
            <Button
              className="cancel"
              fluid
              onClick={(e) => {
                e.preventDefault()
                onClose()
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
