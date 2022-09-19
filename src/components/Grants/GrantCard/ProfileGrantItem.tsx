import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Back } from 'decentraland-ui/dist/components/Back/Back'
import { Mobile } from 'decentraland-ui/dist/components/Media/Media'

import { GrantAttributes } from '../../../entities/Proposal/types'
import locations from '../../../modules/locations'
import { formatDate } from '../../../modules/time'
import Username from '../../User/Username'
import GrantPill from '../GrantPill'

import './ProfileGrantItem.css'

interface Props {
  grant: GrantAttributes
}

function ProfileGrantItem({ grant }: Props) {
  const t = useFormatMessage()
  const intl = useIntl()
  const { user, title, enacted_at, token } = grant
  const enactedDate = new Date(enacted_at * 1000)
  return (
    <Link className="ProfileGrantItem" href={locations.proposal(grant.id)}>
      <div className="ProfileGrantItem__Section">
        <Username className="ProfileGrantItem__Avatar" address={user} variant="avatar" size="medium" />
        <div>
          <h3 className="ProfileGrantItem__Title">{title}</h3>
          <span className="ProfileGrantItem__Details">
            <Mobile>
              <GrantPill type={grant.configuration.category} />
            </Mobile>
            <span className="ProfileGrantItem__Details">
              <Markdown>
                {t('page.profile.grants.item_description', {
                  time: formatDate(enactedDate),
                  amount: intl.formatNumber(grant.size),
                  token,
                })}
              </Markdown>
            </span>
          </span>
        </div>
      </div>
      <div className="ProfileGrantItem__PillContainer">
        <GrantPill type={grant.configuration.category} />
      </div>
      <div className="statusSection">STATUS</div>
      <Back />
    </Link>
  )
}

export default ProfileGrantItem
