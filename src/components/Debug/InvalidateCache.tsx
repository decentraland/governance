import { useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { Governance } from '../../clients/Governance'
import Heading from '../Common/Typography/Heading'
import ErrorMessage from '../Error/ErrorMessage'
import { ContentSection } from '../Layout/ContentLayout'

interface Props {
  className?: string
}

function InvalidateCache({ className }: Props) {
  const [key, setkey] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const handleRemoveCacheKey = async () => {
    setErrorMessage('')
    try {
      await Governance.get().invalidateCache(key)
    } catch (e: unknown) {
      setErrorMessage(`${e}`)
    }
  }

  return (
    <div className={className}>
      <ContentSection>
        <Heading size="sm">{'Invalidate Cache'}</Heading>
        <div>
          <Field placeholder={'Cache key'} value={key} onChange={(_, { value }) => setkey(value)} />
          <Button primary disabled={!key} onClick={handleRemoveCacheKey}>
            {'Remove key'}
          </Button>
        </div>
        {errorMessage && <ErrorMessage label={'Cache delete error'} errorMessage={errorMessage} />}
      </ContentSection>
    </div>
  )
}

export default InvalidateCache
