import { useMemo } from 'react'

import { DAO_DISCORD_URL, FORUM_URL } from '../../../constants'
import { ProposalStatus, ProposalType } from '../../../entities/Proposal/types'
import useAbbreviatedFormatter from '../../../hooks/useAbbreviatedFormatter'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useNewsletterSubscription from '../../../hooks/useNewsletterSubscription'
import useProposals from '../../../hooks/useProposals'
import useTransparency from '../../../hooks/useTransparency'
import Discord from '../../Icon/Discord'
import EmailFilled from '../../Icon/EmailFilled'
import Megaphone from '../../Icon/Megaphone'
import { NewsletterSubscriptionModal } from '../../Modal/NewsletterSubscriptionModal/NewsletterSubscriptionModal'

import Action, { ActionProps } from './Action'
import './BottomBanner.css'
import Stat from './Stat'

function BottomBanner() {
  const t = useFormatMessage()
  const { data } = useTransparency()
  const fundingFormatter = useAbbreviatedFormatter()

  const { proposals: grantsList } = useProposals({
    type: ProposalType.Grant,
    status: ProposalStatus.Enacted,
    page: 1,
    itemsPerPage: 1,
  })

  const { isSubscriptionModalOpen, setIsSubscriptionModalOpen, onSubscriptionSuccess, subscribed, onClose } =
    useNewsletterSubscription()

  const actions: Record<string, ActionProps> = useMemo(
    () => ({
      discord: {
        icon: <Discord className="Discord__Icon" />,
        title: 'page.home.bottom_banner.discord_title',
        description: 'page.home.bottom_banner.discord_description',
        url: DAO_DISCORD_URL,
        onClick: undefined,
      },
      forum: {
        icon: <Megaphone />,
        title: 'page.home.bottom_banner.forum_title',
        description: 'page.home.bottom_banner.forum_description',
        url: FORUM_URL,
        onClick: undefined,
      },
      newsletter: {
        icon: <EmailFilled />,
        title: 'page.home.bottom_banner.newsletter_title',
        description: 'page.home.bottom_banner.newsletter_description',
        url: undefined,
        onClick: () => setIsSubscriptionModalOpen(true),
      },
    }),
    [setIsSubscriptionModalOpen]
  )

  return (
    <div className="BottomBanner">
      <div className="BottomBanner__Info">
        <h2 className="BottomBanner__Title">{t('page.home.bottom_banner.title')}</h2>
        <div className="BottomBanner__Stats">
          <Stat
            title={t('page.home.bottom_banner.funds_value', {
              value: fundingFormatter(data ? Number(data.funding.total) : 0),
            })}
            description={t('page.home.bottom_banner.funds')}
          />
          <Stat title={grantsList ? String(grantsList.total) : '-'} description={t('page.home.bottom_banner.grants')} />
        </div>
      </div>
      <div className="BottomBanner__Actions">
        {Object.entries(actions).map(([key, props]) => (
          <Action
            key={'BottomBanner__Action' + key}
            icon={props.icon}
            url={props.url}
            title={t(props.title)}
            description={t(props.description)}
            onClick={props.onClick}
          />
        ))}
      </div>
      <NewsletterSubscriptionModal
        open={isSubscriptionModalOpen}
        onSubscriptionSuccess={onSubscriptionSuccess}
        subscribed={subscribed}
        onClose={onClose}
      />
    </div>
  )
}

export default BottomBanner
