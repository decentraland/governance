import React from 'react'
import { useIntl } from 'react-intl'

import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { TransparencyGrantsTiers } from '../../clients/DclData'
import { Project } from '../../entities/Proposal/types'
import { isProposalInCliffPeriod } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import { abbreviateTimeDifference, formatDate } from '../../utils/date/Time'
import locations from '../../utils/locations'
import Link from '../Common/Typography/Link'
import Markdown from '../Common/Typography/Markdown'
import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'
import CliffProgress from '../Projects/ProjectCard/CliffProgress'
import ProgressBarTooltip from '../Projects/ProjectCard/ProgressBarTooltip'
import VestingProgress from '../Projects/ProjectCard/VestingProgress'
import ProjectPill from '../Projects/ProjectPill'
import Username from '../User/Username'

import './GrantBeneficiaryItem.css'

interface Props {
  grant: Project
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
                <Markdown
                  className="GrantBeneficiaryItem__Details"
                  size="xs"
                  componentsClassNames={{
                    p: 'GrantBeneficiaryItem__DetailsText',
                    strong: 'GrantBeneficiaryItem__DetailsStrongText',
                  }}
                >
                  {t('page.profile.grants.item_description', {
                    time: formattedEnactedDate,
                    amount: intl.formatNumber(grant.size),
                    token: isInMana ? 'USD' : token,
                  })}
                </Markdown>
              )}
            </div>
          </div>
          <div className="GrantBeneficiaryItem__CategorySection">
            <div className="GrantBeneficiaryItem__PillContainer">
              <ProjectPill type={grant.configuration.category} />
            </div>
            <div className="GrantBeneficiaryItem__VestingProgressContainer">
              <ProgressBarTooltip grant={grant} isInCliff={proposalInCliffPeriod}>
                <div>
                  {proposalInCliffPeriod ? (
                    <CliffProgress enactedAt={enacted_at} basic />
                  ) : (
                    <VestingProgress project={grant} basic />
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
              <div className="GrantBeneficiaryItem__Details">
                <ProjectPill type={grant.configuration.category} />
                {formattedEnactedDate && (
                  <Markdown
                    size="xs"
                    componentsClassNames={{
                      p: 'GrantBeneficiaryItem__DetailsText',
                      strong: 'GrantBeneficiaryItem__DetailsStrongText',
                    }}
                  >
                    {t('page.profile.grants.item_short_description', {
                      time: abbreviateTimeDifference(formattedEnactedDate),
                      amount: intl.formatNumber(grant.size),
                      token: token,
                    })}
                  </Markdown>
                )}
              </div>
            </div>
          </div>
          <ChevronRightCircleOutline />
        </Mobile>
      </Card.Content>
    </Card>
  )
}

export default GrantBeneficiaryItem
