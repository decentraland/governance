import { useState } from 'react'
import { useIntl } from 'react-intl'

import classNames from 'classnames'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'
import { Table } from 'decentraland-ui/dist/components/Table/Table'

import { Delegate } from '../../hooks/useDelegatesInfo'
import Time, { abbreviateTimeDifference } from '../../utils/date/Time'
import Username from '../Common/Username'
import Arrow from '../Icon/Arrow'

import './DelegatesTable.css'
import './DelegatesTableRow.css'

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
      className="DelegatesTableRow"
      onMouseEnter={() => setIsFilled(true)}
      onMouseLeave={() => setIsFilled(false)}
      onClick={() => onDelegateSelected(delegate)}
    >
      <Table.Cell className={classNames('DelegatesTableRow__CandidateName', 'DelegatesTable__Sticky')}>
        <Username className="DelegatesTableRow__Username" address={delegateAddress} size={isMobile ? 'xxs' : 'sm'} />
        <Arrow filled={isFilled} className="DelegatesTableRow__UsernameArrow" />
      </Table.Cell>
      <Table.Cell className="DelegatesTable__ShadowBox" />
      <Table.Cell className="DelegatesTable__PaddedColumn DelegatesTableRow__LastVoted">
        {valueOrHyphen(delegate.lastVoted, (value) => abbreviateTimeDifference(Time.unix(value).fromNow()))}
      </Table.Cell>
      <Table.Cell className="DelegatesTableRow__TimesVoted">
        {valueOrHyphen(delegate.timesVoted, (value) => intl.formatNumber(value))}
      </Table.Cell>
      <Table.Cell className="DelegatesTableRow__PickedBy">{intl.formatNumber(delegate.pickedBy)}</Table.Cell>
      <Table.Cell className="DelegatesTableRow__TotalVP">{intl.formatNumber(delegate.totalVP)}</Table.Cell>
      <Table.Cell className="DelegatesTable__ArrowColumn">
        <Arrow filled={isFilled} />
      </Table.Cell>
    </Table.Row>
  )
}

export default DelegateRow
