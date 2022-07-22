import React from 'react'

import { GrantWithUpdateAttributes } from '../../entities/Proposal/types'
import ProposalUpdate from '../Proposal/Update/ProposalUpdate'

import CliffNotice from './CliffNotice'
import './GrantCardUpdateInfo.css'

export type GrantCardUpdateInfoProps = {
  grant: GrantWithUpdateAttributes
  proposalInCliffPeriod: boolean
}

const GrantCardUpdateInfo = ({ grant, proposalInCliffPeriod }: GrantCardUpdateInfoProps) => {
  const update = grant.update
  const showCliffNotice = !update && proposalInCliffPeriod

  return (
    <div className="GrantCardUpdateInfo">
      {showCliffNotice ? (
        <CliffNotice vestingStartDate={grant.enacted_at} />
      ) : (
        <ProposalUpdate proposal={grant} update={update} expanded={false} index={update?.index} />
      )}
    </div>
  )
}

export default GrantCardUpdateInfo
