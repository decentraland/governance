import React from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { TestData } from '../../hooks/useVotingSectionTestData'

import './VotingSectionTester.css'

interface VotingSectionTesterProps {
  testData: TestData
}

const VotingSectionTester = ({ testData }: VotingSectionTesterProps) => {
  return (
    <div className={'VotingSectionTester'}>
      <span className={'VotingSectionTester__TestName'}>{testData.caseLabel}</span>
      <div className={'VotingSectionTester__Buttons'}>
        <Button basic onClick={testData.previousCase}>
          Prev
        </Button>
        <Button basic onClick={testData.nextCase}>
          Next
        </Button>
      </div>
    </div>
  )
}

export default VotingSectionTester
