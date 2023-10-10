import { useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { SelectField } from 'decentraland-ui/dist/components/SelectField/SelectField'

import { Governance } from '../../clients/Governance'
import { OtterspaceRevokeReason } from '../../entities/Badges/types'
import AddressesSelect from '../AddressSelect/AddressesSelect'
import Heading from '../Common/Typography/Heading'
import Label from '../Common/Typography/Label'
import Text from '../Common/Typography/Text'
import ErrorMessage from '../Error/ErrorMessage'
import { ContentSection } from '../Layout/ContentLayout'

import UploadBadgeSpec from './UploadBadgeSpec'

interface Props {
  className?: string
}

const REVOKE_REASON_OPTIONS = [
  {
    text: 'Abuse',
    value: OtterspaceRevokeReason.Abuse,
  },
  {
    text: 'Left Community',
    value: OtterspaceRevokeReason.LeftCommunity,
  },
  {
    text: 'Tenure Ended',
    value: OtterspaceRevokeReason.TenureEnded,
  },
  {
    text: 'Other',
    value: OtterspaceRevokeReason.Other,
  },
]

export default function BadgesAdmin({ className }: Props) {
  const [recipients, setRecipients] = useState<string[]>([])
  const [badgeCid, setBadgeCid] = useState<string>('')
  const [reason, setReason] = useState<string>(OtterspaceRevokeReason.TenureEnded)
  const [result, setResult] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | undefined | null>()
  const [formDisabled, setFormDisabled] = useState(false)

  async function handleAirdropBadge() {
    if (badgeCid && recipients) {
      await submit(
        async () => Governance.get().airdropBadge(badgeCid, recipients),
        (result) => setResult(JSON.stringify(result))
      )
    }
  }

  async function handleRevokeBadge() {
    if (badgeCid && recipients) {
      await submit(
        async () => Governance.get().revokeBadge(badgeCid, recipients, reason),
        (result) => setResult(JSON.stringify(result))
      )
    }
  }

  async function handleCreateBadgeSpec() {
    if (badgeCid) {
      await submit(
        async () => Governance.get().createBadgeSpec(badgeCid),
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
        <Heading size="sm">{'Badges'}</Heading>
        <div>
          <Heading size="xs">{'Create, Airdrop, Revoke'}</Heading>
          <div>
            <Button
              className="Debug__SectionButton"
              primary
              disabled={formDisabled}
              onClick={() => handleCreateBadgeSpec()}
            >
              {'Create Badge Spec'}
            </Button>
            <Button className="Debug__SideButton" primary disabled={formDisabled} onClick={() => handleAirdropBadge()}>
              {'Airdrop'}
            </Button>
            <Button className="Debug__SideButton" primary disabled={formDisabled} onClick={() => handleRevokeBadge()}>
              {'Revoke'}
            </Button>
          </div>
          <Label>{'Badge Spec Cid'}</Label>
          <Field value={badgeCid} onChange={(_, { value }) => setBadgeCid(value)} />
          <Label>{'Recipients'}</Label>
          <AddressesSelect
            setUsersAddresses={(addresses?: string[]) => setRecipients(addresses || [])}
            isDisabled={formDisabled}
            maxAddressesAmount={20}
          />
          <Label>{'Revoke Reason'}</Label>
          <SelectField
            value={reason}
            onChange={(_, { value }) => setReason(value as string)}
            options={REVOKE_REASON_OPTIONS}
            disabled={formDisabled}
          />
          {result && (
            <>
              <Label>{'Result'}</Label>
              <Text className="Debug__Result">{result}</Text>
            </>
          )}
        </div>
        <UploadBadgeSpec />
      </ContentSection>
      {!!errorMessage && <ErrorMessage label={'Badges Error'} errorMessage={errorMessage} />}
    </div>
  )
}
