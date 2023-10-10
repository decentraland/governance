import classNames from 'classnames'

import useFormatMessage from '../../../hooks/useFormatMessage'
import QuestionCircleIcon from '../../Icon/QuestionCircle'

import './ProposalUpdate.css'

const EmptyProposalUpdate = () => {
  const t = useFormatMessage()

  return (
    <div className={classNames('ProposalUpdate', 'ProposalUpdate--pending')}>
      <div className="ProposalUpdate__Left">
        <div className="ProposalUpdate__IconContainer">
          <QuestionCircleIcon size="16" className="EmptyProposalUpdate__Icon" />
        </div>
        <div className="ProposalUpdate__Description">
          <span>{t('page.grants.empty_update')}</span>
        </div>
      </div>
    </div>
  )
}

export default EmptyProposalUpdate
