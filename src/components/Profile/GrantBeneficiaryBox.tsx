import { useQuery } from '@tanstack/react-query'

import { Governance } from '../../clients/Governance'
import { DEFAULT_QUERY_STALE_TIME } from '../../hooks/constants'
import useFormatMessage from '../../hooks/useFormatMessage'
import { ActionBox } from '../Common/ActionBox'

import GrantBeneficiaryList from './GrantBeneficiaryList'

interface Props {
  address: string | null
}

export default function GrantBeneficiaryBox({ address }: Props) {
  const t = useFormatMessage()
  const { data: grants } = useQuery({
    queryKey: ['grants', address],
    queryFn: async () => {
      if (address) {
        return await Governance.get().getGrantsByUser(address)
      }
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
    enabled: !!address,
  })

  if (grants?.total === 0 || !grants?.data) {
    return null
  }

  return (
    <ActionBox title={t('page.profile.grants.title')} info={t('page.profile.grants.info')}>
      <GrantBeneficiaryList grants={grants?.data} address={address} />
    </ActionBox>
  )
}
