import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { snapshotProposalUrl } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import OpenExternalLink from '../Icon/OpenExternalLink'

import Link from './Typography/Link'

import './SnapshotRedirectButton.css'

interface Props {
  proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>
  inverted?: boolean
}

const SnapshotRedirectButton = ({ proposal, inverted }: Props) => {
  const t = useFormatMessage()
  return (
    <Button
      fluid
      inverted={inverted}
      primary={!inverted}
      href={snapshotProposalUrl(proposal)}
      as={Link}
      className="SnapshotRedirectButton"
    >
      <div className="SnapshotRedirectButton__Hidden" />
      {t('component.snapshot_redirect_button_label')}
      <OpenExternalLink color={inverted ? 'var(--dcl-primary)' : 'var(--white-900)'} />
    </Button>
  )
}

export default SnapshotRedirectButton
