import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Back } from 'decentraland-ui/dist/components/Back/Back'

import locations from '../../modules/locations'
import Username from '../User/Username'

import './DelegatorCardProfile.css'

interface Props {
  address: string
  vp: number
  isLoading?: boolean
}

function DelegatorCardProfile({ isLoading, address, vp }: Props) {
  const t = useFormatMessage()

  return (
    <Link className="DelegatorCardProfile" href={locations.profile({ address })}>
      <div className="DelegatorCardProfile__Section">
        {isLoading ? (
          // https://codesandbox.io/s/react-loading-skeleton-3xwil?file=/src/styles.css
          <Skeleton circle height="100%" width="100%" />
        ) : (
          <Username className="DelegatorCardProfile__Avatar" address={address} variant="avatar" size="medium" />
        )}
        <div>
          <Username className="DelegatorCardProfile__Title" variant="address" address={address} />
          <span className="DelegatorCardProfile__Details">
            <span className="DelegatorCardProfile__DetailsItem">{t('page.profile.delegators.delegated', { vp })}</span>
          </span>
        </div>
      </div>
      <Back />
    </Link>
  )
}

export default DelegatorCardProfile
