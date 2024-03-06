import { Control, FieldErrors, UseFormWatch } from 'react-hook-form'

import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { Reason, reasonSchema } from '../../../../entities/Votes/types'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import TextArea from '../../../Common/Form/TextArea'

import './ReasonVoteArea.css'

type Props = {
  choice: string
  control: Control<Reason>
  errors: FieldErrors<Reason>
  watch: UseFormWatch<Reason>
  isDisabled?: boolean
}

function ReasonVoteArea({ choice, control, errors, watch, isDisabled }: Props) {
  const t = useFormatMessage()
  return (
    <div className="ReasonVoteArea__Container">
      <Header sub>{t('modal.voting_modal_survey.rationale')}</Header>
      <TextArea
        control={control}
        name="reason"
        rules={{
          minLength: {
            value: reasonSchema.shape.reason.minLength,
            message: t('error.ban_name.description_too_short'),
          },
          maxLength: {
            value: reasonSchema.shape.reason.maxLength,
            message: t('error.ban_name.description_too_large'),
          },
        }}
        error={errors.reason?.message}
        info={t('page.submit.character_counter', {
          current: watch('reason').length,
          limit: reasonSchema.shape.reason.maxLength,
        })}
        disabled={isDisabled}
        placeholder={t('modal.voting_modal_survey.rationale_placeholder', { choice })}
      />
    </div>
  )
}

export default ReasonVoteArea
