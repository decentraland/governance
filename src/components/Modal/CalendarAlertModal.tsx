import { useEffect, useMemo, useState } from 'react'

import { UnitTypeLongPlural } from 'dayjs'
import useTrackContext from 'decentraland-gatsby/dist/context/Track/useTrackContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { SegmentEvent } from '../../entities/Events/types'
import { ProposalAttributes } from '../../entities/Proposal/types'
import { proposalUrl } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import { getGoogleCalendarUrl } from '../../utils/projects'
import NumberSelector from '../ProjectRequest/NumberSelector'

import './CalendarAlertModal.css'

type CalendarAlertModalProps = Omit<ModalProps, 'children'> & {
  proposal: Pick<ProposalAttributes, 'id' | 'title' | 'finish_at'>
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

function CalendarAlertModal({ proposal, onClose, ...props }: CalendarAlertModalProps) {
  const t = useFormatMessage()
  const { finish_at, title, id } = proposal
  const [timeValue, setTimeValue] = useState(0)
  const [unit, setUnit] = useState<UnitTypeLongPlural | undefined>()
  const [isDisabled, setIsDisabled] = useState(false)
  const track = useTrackContext()

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
    <Modal {...props} onClose={handleClose} size="tiny" closeIcon={<Close />}>
      <Modal.Content>
        <div className="ProposalModal__Title">
          <Header>{t('modal.calendar_alert.title')}</Header>
        </div>
        <div className="CalendarAlertModal__SelectorContainer">
          <NumberSelector
            value={timeValue}
            min={0}
            max={MAX_TIME_VALUE}
            onChange={setTimeValue}
            label={t('modal.calendar_alert.label')}
            unit={UNITS}
            onUnitChange={setUnit}
          />
        </div>
        <div className="ProposalModal__Actions">
          <Button
            fluid
            primary
            disabled={isDisabled}
            as="a"
            href={alertUrl}
            target="_blank"
            onClick={trackAddToCalendar}
          >
            {t('modal.calendar_alert.add_to_calendar')}
          </Button>
          <Button className="CalendarAlertModal__CancelButton" fluid basic onClick={handleClose}>
            {t('modal.calendar_alert.cancel')}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}

export default CalendarAlertModal
