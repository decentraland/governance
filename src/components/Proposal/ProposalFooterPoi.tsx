import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { NewProposalPOI } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import Link from '../Common/Typography/Link'
import JumpIn from '../Icon/JumpIn'

import './ProposalFooterPoi.css'

export type ProposalFooterPoiProps = {
  configuration: NewProposalPOI
}

export default function ProposalFooterPoi({ configuration }: ProposalFooterPoiProps) {
  const t = useFormatMessage()

  return (
    <div className="ProposalFooterPoi">
      <Button
        primary
        as={Link}
        className="ProposalFooterPoi__Button"
        href={`https://play.decentraland.org/?position=${configuration.x},${configuration.y}`}
      >
        {t('general.jump_in')}
        <JumpIn width="17" height="17" className="ProposalFooterPoi__Icon" />
      </Button>
    </div>
  )
}
