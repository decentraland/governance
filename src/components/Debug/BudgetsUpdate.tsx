import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { TransparencyBudget } from '../../clients/DclData'
import { Governance } from '../../clients/Governance'
import { QuarterBudgetAttributes } from '../../entities/QuarterBudget/types'
import Label from '../Common/Typography/Label'
import ErrorMessage from '../Error/ErrorMessage'
import MarkdownFieldSection from '../Form/MarkdownFieldSection'
import { ContentSection } from '../Layout/ContentLayout'

interface Props {
  className?: string
}

export default function BudgetsUpdate({ className }: Props) {
  const [transparencyBudgets, setTransparencyBudgets] = useState<TransparencyBudget[]>([])
  const [governanceBudgets, setGovernanceBudgets] = useState<QuarterBudgetAttributes[]>([])
  const [errorMessage, setErrorMessage] = useState<any>()
  const [formDisabled, setFormDisabled] = useState(false)
  const { control } = useForm()

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
        <Label>{'Budgets'}</Label>
        <div>
          <Button className="Debug__SectionButton" primary disabled={formDisabled} onClick={() => handleFetchBudgets()}>
            {'Fetch Transparency Budgets'}
          </Button>
        </div>
        <MarkdownFieldSection
          name="transparencyBudgets"
          control={control}
          showMarkdownNotice={false}
          label="Transparency Budgets"
          readOnly={true}
          minHeight={77}
          maxHeight={77}
          value={JSON.stringify(transparencyBudgets)}
          preview={true}
        />
        <div>
          <Button
            className="Debug__SectionButton"
            primary
            disabled={formDisabled}
            onClick={() => handleUpdateBudgets()}
          >
            {'Update Governance Budgets'}
          </Button>
        </div>
        <MarkdownFieldSection
          name="governanceBudgets"
          control={control}
          showMarkdownNotice={false}
          label="Governance Budgets"
          readOnly={true}
          minHeight={77}
          maxHeight={77}
          value={JSON.stringify(governanceBudgets)}
          preview={true}
        />
      </ContentSection>
      {!!errorMessage && <ErrorMessage label={'Budgets Error'} errorMessage={errorMessage} />}
    </div>
  )
}
