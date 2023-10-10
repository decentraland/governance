import { useState } from 'react'

import { Table } from 'decentraland-ui/dist/components/Table/Table'

import { Delegate } from '../../hooks/useDelegatesInfo'
import useFormatMessage from '../../hooks/useFormatMessage'
import { useSortingByKey } from '../../hooks/useSortingByKey'
import Candidates from '../../utils/delegates/candidates.json'
import Sort from '../Icon/Sort'
import { Candidate } from '../Modal/VotingPowerDelegationModal/VotingPowerDelegationCandidatesList'

import './DelegatesTable.css'
import DelegateRow from './DelegatesTableRow'

const DISPLAYED_CANDIDATES = 9
const DEFAULT_SORTING_KEY: DelegateKey = 'lastVoted'
type DelegateKey = keyof Delegate

interface Props {
  delegates: Delegate[]
  setSelectedCandidate: (candidate: Candidate) => void
  full?: boolean
}

const DelegatesTable = ({ delegates, setSelectedCandidate, full }: Props) => {
  const t = useFormatMessage()
  const [sortingKey, setSortingKey] = useState<DelegateKey>(DEFAULT_SORTING_KEY)
  const { sorted: delegatesSorted, changeSort, isDescendingSort } = useSortingByKey(delegates, sortingKey)

  const handleOnDelegateClick = (delegate: Delegate) => {
    const candidateInfo = Candidates.find((deleg) => deleg.address.toLowerCase() === delegate.address.toLowerCase())
    setSelectedCandidate({ ...delegate, ...candidateInfo! })
  }

  const updateSort = (newSortingKey: DelegateKey) => {
    if (newSortingKey !== sortingKey) {
      setSortingKey(newSortingKey)
    } else {
      changeSort()
    }
  }

  const delegatesToDisplay = full ? delegates.length : DISPLAYED_CANDIDATES

  return (
    <div className="DelegatesTable__Wrapper">
      <div className="DelegatesTable__Scroller">
        <Table unstackable basic="very" className="DelegatesTable">
          <Table.Header className="DelegatesTable__Header">
            <Table.Row>
              <Table.HeaderCell className="DelegatesTable__CandidateNameHeader DelegatesTable__Sticky">
                {t('page.home.dao_delegates.candidate_name')}
              </Table.HeaderCell>
              <Table.HeaderCell className="DelegatesTable__ShadowBox DelegatesTable__ShadowBoxHeader" />
              <Table.HeaderCell className="DelegatesTable__SortHeader" onClick={() => updateSort('lastVoted')}>
                <span>
                  {t('page.home.dao_delegates.last_voted')}
                  <Sort descending={isDescendingSort} selected={sortingKey === 'lastVoted'} />
                </span>
              </Table.HeaderCell>
              <Table.HeaderCell className="DelegatesTable__SortHeader" onClick={() => updateSort('timesVoted')}>
                <span>
                  {t('page.home.dao_delegates.times_voted')}
                  <Sort descending={isDescendingSort} selected={sortingKey === 'timesVoted'} />
                </span>
              </Table.HeaderCell>
              <Table.HeaderCell className="DelegatesTable__SortHeader" onClick={() => updateSort('pickedBy')}>
                <span>
                  {t('page.home.dao_delegates.picked_by')}
                  <Sort descending={isDescendingSort} selected={sortingKey === 'pickedBy'} />
                </span>
              </Table.HeaderCell>
              <Table.HeaderCell className="DelegatesTable__SortHeader" onClick={() => updateSort('totalVP')}>
                <span>
                  {t('page.home.dao_delegates.total_vp')}
                  <Sort descending={isDescendingSort} selected={sortingKey === 'totalVP'} />
                </span>
              </Table.HeaderCell>
              <Table.HeaderCell className="DelegatesTable__ArrowColumn" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {delegatesSorted.slice(0, delegatesToDisplay).map((delegate, index) => (
              <DelegateRow
                key={delegate.address + 'row' + index}
                delegate={delegate}
                onDelegateSelected={handleOnDelegateClick}
              />
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

export default DelegatesTable
