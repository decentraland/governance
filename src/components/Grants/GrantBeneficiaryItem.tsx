import React from 'react'
import { useIntl } from 'react-intl'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { TransparencyGrantsTiers } from '../../clients/DclData'
import { Grant } from '../../entities/Proposal/types'
import { isProposalInCliffPeriod } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import { abbreviateTimeDifference, formatDate } from '../../utils/date/Time'
import locations from '../../utils/locations'
import Link from '../Common/Link'
import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'
import Username from '../User/Username'

import CliffProgress from './GrantCard/CliffProgress'
import ProgressBarTooltip from './GrantCard/ProgressBarTooltip'
import VestingProgress from './GrantCard/VestingProgress'

import './GrantBeneficiaryItem.css'
import GrantPill from './GrantPill'

interface Props {
  grant: Grant
}

function GrantBeneficiaryItem({ grant }: Props) {
  const t = useFormatMessage()
  const intl = useIntl()
  const { user, title, enacted_at, token, configuration } = grant
  const proposalInCliffPeriod = !!enacted_at && isProposalInCliffPeriod(enacted_at)
  const isInMana = Object.keys(TransparencyGrantsTiers).slice(0, 3).includes(configuration.tier)
  const formattedEnactedDate = enacted_at ? formatDate(new Date(enacted_at * 1000)) : null

  return (
    <Card as={Link} className="GrantBeneficiaryItem" href={locations.proposal(grant.id)}>
      <Card.Content>
        <NotMobile>
          <div className="GrantBeneficiaryItem__Section">
            <Username className="GrantBeneficiaryItem__Avatar" address={user} variant="avatar" size="medium" />
            <div>
              <h3 className="GrantBeneficiaryItem__Title">{title}</h3>
              {formattedEnactedDate && (
                <span className="GrantBeneficiaryItem__Details">
                  <Markdown>
                    {t('page.profile.grants.item_description', {
                      time: formattedEnactedDate,
                      amount: intl.formatNumber(grant.size),
                      token: isInMana ? 'USD' : token,
                    })}
                  </Markdown>
                </span>
              )}
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
                {formattedEnactedDate && (
                  <span>
                    <Markdown>
                      {t('page.profile.grants.item_short_description', {
                        time: abbreviateTimeDifference(formattedEnactedDate),
                        amount: intl.formatNumber(grant.size),
                        token: token,
                      })}
                    </Markdown>
                  </span>
                )}
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
