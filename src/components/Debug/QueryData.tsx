import { useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { Governance } from '../../clients/Governance'
import Heading from '../Common/Typography/Heading'
import ErrorMessage from '../Error/ErrorMessage'
import { ContentSection } from '../Layout/ContentLayout'

import './QueryData.css'

interface Props {
  className?: string
}

function QueryData({ className }: Props) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const handleGetAllEvents = async () => {
    setErrorMessage('')
    try {
      console.log(await Governance.get().getAllEvents())
    } catch (e: unknown) {
      setErrorMessage(`${e}`)
    }
  }

  const handleGetAllAirdropJobs = async () => {
    setErrorMessage('')
    try {
      console.log(await Governance.get().getAllAirdropJobs())
    } catch (e: unknown) {
      setErrorMessage(`${e}`)
    }
  }

  return (
    <div className={className}>
      <ContentSection>
        <Heading size="sm">{'Query Data'}</Heading>
        <div className="QueryData__Buttons">
          <Button primary onClick={handleGetAllEvents}>
            {'Get All Events'}
          </Button>
          <Button primary onClick={handleGetAllAirdropJobs}>
            {'Get All Airdrop Jobs'}
          </Button>
        </div>
        {errorMessage && <ErrorMessage label={'Latest error'} errorMessage={errorMessage} />}
      </ContentSection>
    </div>
  )
}

export default QueryData
