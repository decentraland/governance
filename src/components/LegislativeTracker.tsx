import useFormatMessage from '../hooks/useFormatMessage'

import Text from './Common/Typography/Text'
import OpenExternalLink from './Icon/OpenExternalLink'

import './LegislativeTracker.css'

const LEGISLATIVE_TRACKER_URL =
  'https://www.notion.so/dcl-dao/Governance-Legislative-Tracker-Digest-BETA-7a9ef2f2f9d142d39cd7b33391ec97ae?pvs=4)'

export default function LegislativeTracker() {
  const t = useFormatMessage()

  return (
    <div className="LegislativeTracker">
      <h3 className="LegislativeTracker__Title">{t('page.proposal_list.legislative_tracker.title')}</h3>
      <Text className="LegislativeTracker__Description">{t('page.proposal_list.legislative_tracker.description')}</Text>
      <a className="LegislativeTracker__LinkButton" href={LEGISLATIVE_TRACKER_URL}>
        {t('page.proposal_list.legislative_tracker.button')} <OpenExternalLink />
      </a>
    </div>
  )
}
