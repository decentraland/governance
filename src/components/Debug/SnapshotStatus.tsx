import classNames from 'classnames'

import useFormatMessage from '../../hooks/useFormatMessage'
import useSnapshotStatus from '../../hooks/useSnapshotStatus'
import Markdown from '../Common/Typography/Markdown'
import WarningTriangle from '../Icon/WarningTriangle'

import './SnapshotStatus.css'

export default function SnapshotStatus() {
  const t = useFormatMessage()
  const showSnapshotStatus = useSnapshotStatus()

  return (
    <div className={classNames(`SnapshotStatus__TopBar`, showSnapshotStatus && 'SnapshotStatus__TopBar--visible')}>
      <WarningTriangle size="18" />
      <Markdown size="sm" componentsClassNames={{ p: 'SnapshotStatus__Text', strong: 'SnapshotStatus__Text' }}>
        {t('page.debug.snapshot_status.label')}
      </Markdown>
    </div>
  )
}
