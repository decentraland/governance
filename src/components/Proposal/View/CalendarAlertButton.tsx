import React from 'react'

import useFormatMessage from '../../../hooks/useFormatMessage'
import CalendarAdd from '../../Icon/CalendarAdd'

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
    <SidebarButton loading={loading} disabled={disabled} onClick={onClick}>
      <div className="CalendarAlertButton__IconContainer">
        <CalendarAdd size="16" />
      </div>
      <span>{t('page.proposal_detail.calendar_button')}</span>
    </SidebarButton>
  )
}

export default CalendarAlertButton
