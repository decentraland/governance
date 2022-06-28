import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import './NewBadge.css'

function NewBadge() {
  const t = useFormatMessage()
  return <div className="NewBadge">{t('category.new')}</div>
}

export default NewBadge
