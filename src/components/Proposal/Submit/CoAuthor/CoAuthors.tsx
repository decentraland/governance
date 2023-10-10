import useFormatMessage from '../../../../hooks/useFormatMessage'
import AddressesSelect from '../../../AddressSelect/AddressesSelect'
import SubLabel from '../../../Common/SubLabel'
import Label from '../../../Common/Typography/Label'

import './CoAuthors.css'

interface CoAuthors {
  coAuthors?: string[]
}

export interface CoAuthorProps {
  setCoAuthors: (addresses?: string[]) => void
  isDisabled?: boolean
}

const MAX_COAUTHORS_AMOUNT = 5

function CoAuthors({ setCoAuthors, isDisabled }: CoAuthorProps) {
  const t = useFormatMessage()

  return (
    <div className="CoAuthors">
      <div className="CoAuthors__LabelContainer">
        <Label>{t('page.submit.co_author_label')}</Label>
        <sup className="Optional">{t('page.submit.optional_tooltip')}</sup>
      </div>
      <SubLabel>{t('page.submit.co_author_description')}</SubLabel>
      <AddressesSelect
        setUsersAddresses={setCoAuthors}
        isDisabled={isDisabled}
        maxAddressesAmount={MAX_COAUTHORS_AMOUNT}
        addressAlias={t('page.submit.co_author_alias')}
        addressesAlias={t('page.submit.co_author_plural')}
        loggedUserIsInvalid
        loggedUserInvalidKey={'page.submit.co_author_as_author_error'}
      />
    </div>
  )
}

export default CoAuthors
