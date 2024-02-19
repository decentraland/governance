import { useEffect, useMemo, useState } from 'react'

import { UnitTypeLongPlural } from 'dayjs'

import { SegmentEvent } from '../../entities/Events/types'
import { ProposalAttributes } from '../../entities/Proposal/types'
import { proposalUrl } from '../../entities/Proposal/utils'
import useAnalyticsTrack from '../../hooks/useAnalyticsTrack'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import { getGoogleCalendarUrl } from '../../utils/projects'
import NumberSelector from '../ProjectRequest/NumberSelector'

import './CalendarAlertModal.css'
import ConfirmationModal from './ConfirmationModal'

interface Props {
  proposal: Pick<ProposalAttributes, 'id' | 'title' | 'finish_at'>
  onClose: () => void
  open: boolean
}

const UNITS: UnitTypeLongPlural[] = ['minutes', 'hours', 'days']
const MAX_TIME_VALUE = 300

function getAlertDate(finishAt: ProposalAttributes['finish_at'], value: number, unit: UnitTypeLongPlural): Date | null {
  const proposalFinishDate = Time.from(finishAt)
  const currentDate = Time()
  const alertDate = proposalFinishDate.subtract(value, unit)
  if (alertDate.isBefore(currentDate)) {
    return null
  }
  return alertDate.toDate()
}

function CalendarAlertModal({ proposal, onClose, open }: Props) {
  const t = useFormatMessage()
  const { finish_at, title, id } = proposal
  const [timeValue, setTimeValue] = useState(0)
  const [unit, setUnit] = useState<UnitTypeLongPlural | undefined>()
  const [isDisabled, setIsDisabled] = useState(false)
  const track = useAnalyticsTrack()

  const trackAddToCalendar = () => track(SegmentEvent.ActionPerformed, { type: 'add to calendar' })

  const handleClose = () => {
    onClose()
    setTimeValue(0)
    setUnit(undefined)
  }

  const alertDate = useMemo(
    () => (unit ? getAlertDate(finish_at, timeValue, unit) : null),
    [finish_at, unit, timeValue]
  )

  useEffect(() => {
    setIsDisabled(!alertDate)
  }, [alertDate])

  const alertUrl = getGoogleCalendarUrl({
    title: t(`modal.calendar_alert.calendar_title`, { title }),
    details: t(`modal.calendar_alert.calendar_details`, {
      finish_date: Time.from(finish_at).format('MMM DD, YYYY HH:mm'),
      url: proposalUrl(id),
    }),
    startAt: alertDate!,
  })

  return (
    <ConfirmationModal
      title={t('modal.calendar_alert.title')}
      description={
        <div className="CalendarAlertModal__SelectorContainer">
          <NumberSelector
            className="CalendarAlertModal__NumberSelector"
            value={timeValue}
            min={0}
            max={MAX_TIME_VALUE}
            onChange={setTimeValue}
            label={t('modal.calendar_alert.label')}
            unit={UNITS}
            onUnitChange={setUnit}
          />
        </div>
      }
      isOpen={open}
      isDisabled={isDisabled}
      onPrimaryClick={trackAddToCalendar}
      primaryButtonHref={alertUrl}
      onClose={handleClose}
      onSecondaryClick={handleClose}
      primaryButtonText={t('modal.calendar_alert.add_to_calendar')}
      secondaryButtonText={t('modal.calendar_alert.cancel')}
    />
  )
}

export default CalendarAlertModal
