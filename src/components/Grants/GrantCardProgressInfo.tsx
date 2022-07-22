import React from 'react'

import { GrantWithUpdateAttributes } from '../../entities/Proposal/types'

import CliffProgress from './CliffProgress'
import './GrantCard.css'
import VestingProgress from './VestingProgress'

export type GrantCardProgressInfoProps = {
  grant: GrantWithUpdateAttributes
  proposalInCliffPeriod: boolean
}

const GrantCardProgressInfo = ({ grant, proposalInCliffPeriod }: GrantCardProgressInfoProps) => {
  return (
    <>{proposalInCliffPeriod ? <CliffProgress enactedAt={grant.enacted_at} /> : <VestingProgress grant={grant} />}</>
  )
}

export default GrantCardProgressInfo
