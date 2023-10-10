import useFormatMessage from '../../hooks/useFormatMessage'

import './CoauthorRequestLabel.css'

function CoauthorRequestLabel() {
  const t = useFormatMessage()
  return <div className="CoauthorRequestLabel">{t('page.coauthor_detail.pending_label')}</div>
}

export default CoauthorRequestLabel
