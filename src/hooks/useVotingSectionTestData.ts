import { useState } from 'react'

import { TEST_CASES, TEST_CHOICES } from '../components/Section/ProposalResultSectionTestCases'
import { Vote } from '../entities/Votes/types'

export interface TestData {
  caseLabel: string
  account: string
  accountDelegate: string | null
  delegators: string[]
  votes: Record<string, Vote> | null | undefined
  choices: string[]
  nextCase?: () => void
  previousCase?: () => void
}

export default function useVotingSectionTestData(): TestData | null {
  const testing = true // TODO: this can all be deleted after demo, or we can use a feature flag || env var
  if (!testing) return null
  const [testCaseIndex, setTestCaseIndex] = useState(0)
  const testData: TestData = {
    ...TEST_CASES[testCaseIndex],
    choices: TEST_CHOICES,
  }
  testData.nextCase = () => {
    if (testCaseIndex < TEST_CASES.length - 1) setTestCaseIndex(testCaseIndex + 1)
  }

  testData.previousCase = () => {
    if (testCaseIndex > 0) setTestCaseIndex(testCaseIndex - 1)
  }
  return testData
}
