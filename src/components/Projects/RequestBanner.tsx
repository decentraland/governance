import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { ProposalType } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import locations from '../../utils/locations'
import Link from '../Common/Typography/Link'

import './RequestBanner.css'

export default function RequestBanner() {
  const t = useFormatMessage()

  return (
    <div className="RequestBanner">
      <div className="RequestBanner__Title">{t('page.grants.request_banner.title')}</div>
      <div className="RequestBanner__Description">{t('page.grants.request_banner.description')}</div>
      <Link href={locations.submit(ProposalType.Grant)}>
        <Button fluid className="RequestBanner__Button">
          {t('page.grants.request_banner.button')}
        </Button>
      </Link>
    </div>
  )
}
