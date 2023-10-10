import classNames from 'classnames'

import useFormatMessage from '../../hooks/useFormatMessage'
import locations from '../../utils/locations'
import Link from '../Common/Typography/Link'

import './Breadcrumb.css'

interface Props {
  isProposalActive: boolean
}

export default function Breadcrumb({ isProposalActive }: Props) {
  const t = useFormatMessage()
  return (
    <div className="Breadcrumb">
      <Link
        href={locations.home()}
        className={classNames('Breadcrumb__Link', !isProposalActive && 'Breadcrumb__Link--inactive')}
      >
        {t('navigation.dao')}
      </Link>
      <Link
        href={locations.proposals()}
        className={classNames('Breadcrumb__Link', !isProposalActive && 'Breadcrumb__Link--inactive')}
      >
        {t('navigation.proposals')}
      </Link>
    </div>
  )
}
