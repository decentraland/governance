import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import QuestionCircleIcon from '../../Icon/QuestionCircle'

import './ProposalUpdate.css'

const EmptyProposalUpdate = () => {
  const t = useFormatMessage()

  return (
    <div role="button" className={TokenList.join(['ProposalUpdate', 'ProposalUpdate--pending'])}>
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
