import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { Table } from 'decentraland-ui/dist/components/Table/Table'

import { Delegate } from '../../hooks/useDelegatesInfo'
import { useSortingByKey } from '../../hooks/useSortingByKey'
import useVotingPowerInformation from '../../hooks/useVotingPowerInformation'
import Candidates from '../../modules/delegates/candidates.json'
import Sort from '../Icon/Sort'
import VotingPowerDelegationDetail from '../Modal/VotingPowerDelegationDetail/VotingPowerDelegationDetail'
import { Candidate } from '../Modal/VotingPowerDelegationModal/VotingPowerDelegationModal'
import DelegateRow from '../Table/DelegatesTableRow'

import './DelegatesTable.css'

const DISPLAYED_CANDIDATES = 9
const DEFAULT_SORTING_KEY: DelegateKey = 'lastVoted'
type DelegateKey = keyof Delegate

interface Props {
  delegates: Delegate[]
  userAddress: string | null
}

const DelegatesTable = ({ delegates, userAddress }: Props) => {
  const t = useFormatMessage()
  const [sortingKey, setSortingKey] = useState<DelegateKey>(DEFAULT_SORTING_KEY)
  const { sorted: delegatesSorted, changeSort, isDescendingSort } = useSortingByKey(delegates, sortingKey)
  const { ownVotingPower } = useVotingPowerInformation(userAddress)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const clearSelectedCandidate = () => setSelectedCandidate(null)

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

  return (
    <>
      <div className="DelegatesTable__Wrapper">
        <div className="DelegatesTable__Scroller">
          <Table unstackable basic="very" className="DelegatesTable">
            <Table.Header className="DelegatesTable__Header">
              <Table.Row>
                <Table.HeaderCell className="DelegatesTable__CandidateNameHeader DelegatesTable__Sticky">
                  {t('page.home.dao_delegates.candidate_name')}
                </Table.HeaderCell>
                <Table.HeaderCell className="DelegatesTable__ShadowBox DelegatesTable__ShadowBoxHeader" />
                <Table.HeaderCell className="DelegatesTable__PaddedColumn" onClick={() => updateSort('lastVoted')}>
                  <span>
                    {t('page.home.dao_delegates.last_voted')}
                    <Sort descending={isDescendingSort} selected={sortingKey === 'lastVoted'} />
                  </span>
                </Table.HeaderCell>
                <Table.HeaderCell onClick={() => updateSort('timesVoted')}>
                  <span>
                    {t('page.home.dao_delegates.times_voted')}
                    <Sort descending={isDescendingSort} selected={sortingKey === 'timesVoted'} />
                  </span>
                </Table.HeaderCell>
                <Table.HeaderCell onClick={() => updateSort('pickedBy')}>
                  <span>
                    {t('page.home.dao_delegates.picked_by')}
                    <Sort descending={isDescendingSort} selected={sortingKey === 'pickedBy'} />
                  </span>
                </Table.HeaderCell>
                <Table.HeaderCell onClick={() => updateSort('totalVP')}>
                  <span>
                    {t('page.home.dao_delegates.total_vp')}
                    <Sort descending={isDescendingSort} selected={sortingKey === 'totalVP'} />
                  </span>
                </Table.HeaderCell>
                <Table.HeaderCell className="DelegatesTable__ArrowColumn" />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {delegatesSorted.slice(0, DISPLAYED_CANDIDATES).map((delegate, index) => (
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
      {selectedCandidate && (
        <Modal
          onClose={clearSelectedCandidate}
          size="small"
          closeIcon={<Close />}
          className="GovernanceContentModal VotingPowerDelegationModal"
          open={!!selectedCandidate}
        >
          <VotingPowerDelegationDetail
            userVP={ownVotingPower}
            candidate={selectedCandidate}
            onBackClick={clearSelectedCandidate}
          />
        </Modal>
      )}
    </>
  )
}

export default DelegatesTable
