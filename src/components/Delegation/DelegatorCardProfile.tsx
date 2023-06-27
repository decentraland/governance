import React from 'react'
import { useIntl } from 'react-intl'

import useFormatMessage from '../../hooks/useFormatMessage'
import locations from '../../utils/locations'
import Link from '../Common/Typography/Link'
import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'
import Username from '../User/Username'

import './DelegatorCardProfile.css'

interface Props {
  address: string
  vp: number
}

function DelegatorCardProfile({ address, vp }: Props) {
  const t = useFormatMessage()
  const intl = useIntl()

  return (
    <Link className="DelegatorCardProfile" href={locations.profile({ address })}>
      <div className="DelegatorCardProfile__Section">
        <Username className="DelegatorCardProfile__Avatar" address={address} variant="avatar" size="medium" />
        <div>
          <Username className="DelegatorCardProfile__Title" variant="address" address={address} />
          <span className="DelegatorCardProfile__Details">
            <span className="DelegatorCardProfile__DetailsItem">
              {t('page.profile.delegators.delegated', { vp: intl.formatNumber(vp) })}
            </span>
          </span>
        </div>
      </div>
      <ChevronRightCircleOutline />
    </Link>
  )
}

export default DelegatorCardProfile
