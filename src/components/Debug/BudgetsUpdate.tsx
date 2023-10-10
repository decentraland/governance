import { useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { TransparencyBudget } from '../../clients/DclData'
import { Governance } from '../../clients/Governance'
import { QuarterBudgetAttributes } from '../../entities/QuarterBudget/types'
import Heading from '../Common/Typography/Heading'
import Label from '../Common/Typography/Label'
import Text from '../Common/Typography/Text'
import ErrorMessage from '../Error/ErrorMessage'
import { ContentSection } from '../Layout/ContentLayout'

interface Props {
  className?: string
}

export default function BudgetsUpdate({ className }: Props) {
  const [transparencyBudgets, setTransparencyBudgets] = useState<TransparencyBudget[]>([])
  const [governanceBudgets, setGovernanceBudgets] = useState<QuarterBudgetAttributes[]>([])
  const [errorMessage, setErrorMessage] = useState<any>()
  const [formDisabled, setFormDisabled] = useState(false)

  async function handleFetchBudgets() {
    await submit<TransparencyBudget[]>(async () => Governance.get().getTransparencyBudgets(), setTransparencyBudgets)
  }

  async function handleUpdateBudgets() {
    await submit<QuarterBudgetAttributes[]>(
      async () => Governance.get().updateGovernanceBudgets(),
      setGovernanceBudgets
    )
  }

  async function submit<T>(submit: () => Promise<T>, update: (result: T) => void) {
    setFormDisabled(true)
    Promise.resolve()
      .then(async () => {
        const result: T = await submit()
        console.log('result', result)
        update(result)
      })
      .then((result) => {
        console.log('result', result)
        setFormDisabled(false)
        setErrorMessage('')
      })
      .catch((err) => {
        console.error(err, { ...err })
        setErrorMessage(err.message)
        setFormDisabled(false)
      })
  }

  return (
    <div className={className}>
      <ContentSection>
        <Heading size="sm">{'Budgets'}</Heading>
        <div>
          <Button className="Debug__SectionButton" primary disabled={formDisabled} onClick={() => handleFetchBudgets()}>
            {'Fetch Transparency Budgets'}
          </Button>
          <Button className="Debug__SideButton" primary disabled={formDisabled} onClick={() => handleUpdateBudgets()}>
            {'Update Governance Budgets'}
          </Button>
        </div>
        {transparencyBudgets.length > 0 && (
          <>
            <Label>{'Transparency Budgets'}</Label>
            <Text>{JSON.stringify(transparencyBudgets)}</Text>
          </>
        )}
        {governanceBudgets.length > 0 && (
          <>
            <Label>{'Updated Governance Budgets'}</Label>
            <Text>{JSON.stringify(governanceBudgets)}</Text>
          </>
        )}
      </ContentSection>
      {!!errorMessage && <ErrorMessage label={'Budgets Error'} errorMessage={errorMessage} />}
    </div>
  )
}
