import useFormatMessage from '../../hooks/useFormatMessage'
import useGrantsByUser from '../../hooks/useGrantsByUser'

import { ActionBox } from './ActionBox'
import GrantBeneficiaryList from './GrantBeneficiaryList'

interface Props {
  address: string | null
}

export default function GrantBeneficiaryBox({ address }: Props) {
  const t = useFormatMessage()
  const grants = useGrantsByUser(address, true)
  const hasGrants = grants.length > 0

  if (!hasGrants) return null

  return (
    <ActionBox title={t('page.profile.grants.title')} info={t('page.profile.grants.info')}>
      <GrantBeneficiaryList grants={grants} />
    </ActionBox>
  )
}
