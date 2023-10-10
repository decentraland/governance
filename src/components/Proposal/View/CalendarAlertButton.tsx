import useFormatMessage from '../../../hooks/useFormatMessage'
import CalendarAdd from '../../Icon/CalendarAdd'
import NewBadge from '../NewBadge/NewBadge'

import './CalendarAlertButton.css'
import SidebarButton from './SidebarButton'

interface Props {
  loading?: boolean
  disabled?: boolean
  onClick: () => void
}

function CalendarAlertButton({ loading, disabled, onClick }: Props) {
  const t = useFormatMessage()
  return (
    <SidebarButton className="CalendarAlertButton" loading={loading} disabled={disabled} onClick={onClick}>
      <div className="CalendarAlertButton__Container">
        <CalendarAdd className="CalendarAlertButton__Icon" size="16" />
        <span>{t('page.proposal_detail.calendar_button')}</span>
      </div>
      {!disabled && <NewBadge />}
    </SidebarButton>
  )
}

export default CalendarAlertButton
