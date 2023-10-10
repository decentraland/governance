import { useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { SelectField } from 'decentraland-ui/dist/components/SelectField/SelectField'

import { Governance } from '../../clients/Governance'
import Heading from '../Common/Typography/Heading'
import Label from '../Common/Typography/Label'
import Text from '../Common/Typography/Text'
import ErrorMessage from '../Error/ErrorMessage'
import { ContentSection } from '../Layout/ContentLayout'

interface Props {
  className?: string
}

const FUNCTION_NAME_OPTIONS = [
  {
    text: 'runQueuedAirdropJobs',
    value: 'runQueuedAirdropJobs',
  },
  {
    text: 'giveAndRevokeLandOwnerBadges',
    value: 'giveAndRevokeLandOwnerBadges',
  },
  {
    text: 'giveTopVoterBadges',
    value: 'giveTopVoterBadges',
  },
]

export default function TriggerFunction({ className }: Props) {
  const [functionName, setFunctionName] = useState<string>('')
  const [result, setResult] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | undefined | null>()
  const [formDisabled, setFormDisabled] = useState(false)

  async function handleTriggerFunction() {
    if (functionName && functionName.length > 0) {
      await submit(
        async () => Governance.get().triggerFunction(functionName),
        (result) => setResult(JSON.stringify(result))
      )
    }
  }

  async function submit<T>(submit: () => Promise<T>, update: (result: T) => void) {
    setFormDisabled(true)
    Promise.resolve()
      .then(async () => {
        const result: T = await submit()
        update(result)
      })
      .then(() => {
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
        <Heading size="sm">{'Trigger Function'}</Heading>
        <div>
          <div>
            <Button
              className="Debug__SectionButton"
              primary
              disabled={formDisabled}
              onClick={() => handleTriggerFunction()}
            >
              {'Pimbi'}
            </Button>
          </div>
          <Label>{'Function Name'}</Label>
          <SelectField
            value={functionName}
            onChange={(_, { value }) => setFunctionName(value as string)}
            options={FUNCTION_NAME_OPTIONS}
            disabled={formDisabled}
          />
          {result && (
            <>
              <Label>{'Result'}</Label>
              <Text className="Debug__Result">{result}</Text>
            </>
          )}
        </div>
      </ContentSection>
      {!!errorMessage && <ErrorMessage label={'Trigger Error'} errorMessage={errorMessage} />}
    </div>
  )
}
