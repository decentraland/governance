import React from 'react'

import classNames from 'classnames'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import CalendarAdd from '../../Icon/CalendarAdd'

interface Props {
  loading?: boolean
  disabled?: boolean
  onClick: () => void
}

function CalendarAlertButton({ loading, disabled, onClick }: Props) {
  const t = useFormatMessage()
  return (
    <button
      onClick={onClick}
      className={classNames(
        'DetailsSection',
        'SectionButton',
        loading && 'SectionButton--loading',
        disabled && 'SectionButton--disabled'
      )}
    >
      <div className="SectionButton__Container">
        <CalendarAdd size="20" />
        <span>{t('page.proposal_detail.calendar_button')}</span>
      </div>
    </button>
  )
}

export default CalendarAlertButton
