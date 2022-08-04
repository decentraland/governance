import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { CANDIDATE_ADDRESSES } from '../../constants'
import useDelegatesInfo from '../../hooks/useDelegatesInfo'
import DelegatesTable from '../Table/DelegatesTable'

import HomeSectionHeader from './HomeSectionHeader'

const DaoDelegates = () => {
  const t = useFormatMessage()
  const delegates = useDelegatesInfo(CANDIDATE_ADDRESSES)
  const [address, authState] = useAuthContext()
  const loading = !delegates && authState.loading

  return (
    <div>
      <HomeSectionHeader
        title={t('page.home.dao_delegates.title')}
        description={t('page.home.dao_delegates.description')}
      />
      <Loader active={loading} />
      {!loading && <DelegatesTable delegates={delegates} userAddress={address} />}
    </div>
  )
}

export default DaoDelegates
