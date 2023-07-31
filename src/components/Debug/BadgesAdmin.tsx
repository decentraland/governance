import React, { useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { Governance } from '../../clients/Governance'
import AddressesSelect from '../AddressSelect/AddressesSelect'
import Heading from '../Common/Typography/Heading'
import Label from '../Common/Typography/Label'
import Text from '../Common/Typography/Text'
import ErrorMessage from '../Error/ErrorMessage'
import { ContentSection } from '../Layout/ContentLayout'

interface Props {
  className?: string
}

export default function BadgesAdmin({ className }: Props) {
  const [recipients, setRecipients] = useState<string[] | undefined>([])
  const [badgeCid, setBadgeCid] = useState<string | undefined>()
  const [result, setResult] = useState<string | null>()
  const [errorMessage, setErrorMessage] = useState<any>()
  const [formDisabled, setFormDisabled] = useState(false)

  async function handleAirdropBadge() {
    if (badgeCid && recipients) {
      console.log('submiting!')
      await submit(
        async () => Governance.get().airdropBadge(badgeCid, recipients),
        (result) => setResult(result)
      )
    }
  }

  async function handleRevokeBadge() {
    if (badgeCid && recipients) {
      await submit(
        async () => Governance.get().revokeBadge(badgeCid, recipients),
        (result) => setResult(result)
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
        <Heading size="sm">{'Badges'}</Heading>
        <div>
          <Button className="Debug__SectionButton" primary disabled={formDisabled} onClick={() => handleAirdropBadge()}>
            {'Airdrop'}
          </Button>
          <Button className="Debug__SideButton" primary disabled={formDisabled} onClick={() => handleRevokeBadge()}>
            {'Revoke'}
          </Button>
        </div>
        <Label>{'Badge Spec Cid'}</Label>
        <Field value={badgeCid} onChange={(_, { value }) => setBadgeCid(value)} />
        <div>
          <Label>{'Recipients'}</Label>
          <AddressesSelect
            setUsersAddresses={(addresses?: string[]) => setRecipients(addresses)}
            isDisabled={formDisabled}
            maxAddressesAmount={20}
            allowLoggedUserAccount={true}
          />
        </div>
        {result && (
          <>
            <Label>{'Result'}</Label>
            <Text>{result}</Text>
          </>
        )}
      </ContentSection>
      {!!errorMessage && <ErrorMessage label={'Budgets Error'} errorMessage={errorMessage} />}
    </div>
  )
}
