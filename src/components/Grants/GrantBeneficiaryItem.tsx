import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { TransparencyGrantsTiers } from '../../clients/DclData'
import { TransparencyGrant } from '../../entities/Proposal/types'
import { isProposalInCliffPeriod } from '../../entities/Proposal/utils'
import locations from '../../modules/locations'
import { abbreviateTimeDifference, formatDate } from '../../modules/time'
import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'
import Username from '../User/Username'

import CliffProgress from './GrantCard/CliffProgress'
import ProgressBarTooltip from './GrantCard/ProgressBarTooltip'
import VestingProgress from './GrantCard/VestingProgress'

import './GrantBeneficiaryItem.css'
import GrantPill from './GrantPill'

interface Props {
  grant: TransparencyGrant
}

function GrantBeneficiaryItem({ grant }: Props) {
  const t = useFormatMessage()
  const intl = useIntl()
  const { user, title, enacted_at, token, configuration } = grant
  const enactedDate = new Date(enacted_at * 1000)
  const proposalInCliffPeriod = isProposalInCliffPeriod(grant)
  const isInMana = Object.keys(TransparencyGrantsTiers).slice(0, 3).includes(configuration.tier)

  return (
    <Card as={Link} className="GrantBeneficiaryItem" href={locations.proposal(grant.id)}>
      <Card.Content>
        <NotMobile>
          <div className="GrantBeneficiaryItem__Section">
            <Username className="GrantBeneficiaryItem__Avatar" address={user} variant="avatar" size="medium" />
            <div>
              <h3 className="GrantBeneficiaryItem__Title">{title}</h3>
              <span className="GrantBeneficiaryItem__Details">
                <Markdown>
                  {t('page.profile.grants.item_description', {
                    time: formatDate(enactedDate),
                    amount: intl.formatNumber(grant.size),
                    token: isInMana ? 'USD' : token,
                  })}
                </Markdown>
              </span>
            </div>
          </div>
          <div className="GrantBeneficiaryItem__CategorySection">
            <div className="GrantBeneficiaryItem__PillContainer">
              <GrantPill type={grant.configuration.category} />
            </div>
            <div className="GrantBeneficiaryItem__VestingProgressContainer">
              <ProgressBarTooltip grant={grant} isInCliff={proposalInCliffPeriod}>
                <div>
                  {proposalInCliffPeriod ? (
                    <CliffProgress enactedAt={enacted_at} basic />
                  ) : (
                    <VestingProgress grant={grant} basic />
                  )}
                </div>
              </ProgressBarTooltip>
            </div>
            <ChevronRightCircleOutline />
          </div>
        </NotMobile>
        <Mobile>
          <div className="GrantBeneficiaryItem__Section">
            <div className="GrantBeneficiaryItem__GrantInfo">
              <h3 className="GrantBeneficiaryItem__Title">{title}</h3>
              <span className="GrantBeneficiaryItem__Details">
                <GrantPill type={grant.configuration.category} />
                <span>
                  <Markdown>
                    {t('page.profile.grants.item_short_description', {
                      time: abbreviateTimeDifference(formatDate(enactedDate)),
                      amount: intl.formatNumber(grant.size),
                      token: token,
                    })}
                  </Markdown>
                </span>
              </span>
            </div>
          </div>
          <ChevronRightCircleOutline />
        </Mobile>
      </Card.Content>
    </Card>
  )
}

export default GrantBeneficiaryItem
