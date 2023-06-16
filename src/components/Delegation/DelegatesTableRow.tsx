import React, { useState } from 'react'

import classNames from 'classnames'
import { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'
import { Table } from 'decentraland-ui/dist/components/Table/Table'

import { Delegate } from '../../hooks/useDelegatesInfo'
import Time, { abbreviateTimeDifference } from '../../utils/date/Time'
import Arrow from '../Icon/Arrow'
import Username from '../User/Username'

import './DelegatesTable.css'

function valueOrHyphen<K>(value: K, formatter: (param: K) => string) {
  return value ? formatter(value) : '-'
}

interface Props {
  delegate: Delegate
  onDelegateSelected: (delegate: Delegate) => void
}

function DelegateRow({ delegate, onDelegateSelected }: Props) {
  const intl = useIntl()
  const isMobile = useMobileMediaQuery()
  const delegateAddress = delegate.address.toLowerCase()
  const [isFilled, setIsFilled] = useState(false)

  return (
    <Table.Row
      className="DelegatesTable__DelegateRow"
      onMouseEnter={() => setIsFilled(true)}
      onMouseLeave={() => setIsFilled(false)}
      onClick={() => onDelegateSelected(delegate)}
    >
      <Table.Cell className={classNames('DelegatesTable__CandidateName', 'DelegatesTable__Sticky')}>
        <Username address={delegateAddress} size={isMobile ? 'tiny' : 'small'} />
        <Arrow filled={isFilled} className="DelegatesTable__UsernameArrow" />
      </Table.Cell>
      <Table.Cell className="DelegatesTable__ShadowBox" />
      <Table.Cell className="DelegatesTable__PaddedColumn DelegatesTable__LastVoted">
        {valueOrHyphen(delegate.lastVoted, (value) => abbreviateTimeDifference(Time.unix(value).fromNow()))}
      </Table.Cell>
      <Table.Cell className="DelegatesTable__TimesVoted">
        {valueOrHyphen(delegate.timesVoted, (value) => intl.formatNumber(value))}
      </Table.Cell>
      <Table.Cell className="DelegatesTable__PickedBy">{intl.formatNumber(delegate.pickedBy)}</Table.Cell>
      <Table.Cell className="DelegatesTable__TotalVP">{intl.formatNumber(delegate.totalVP)}</Table.Cell>
      <Table.Cell className="DelegatesTable__ArrowColumn">
        <Arrow filled={isFilled} />
      </Table.Cell>
    </Table.Row>
  )
}

export default DelegateRow
