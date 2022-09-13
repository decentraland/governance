import React, { useEffect, useMemo } from 'react'

import Anchor from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { CANDIDATE_ADDRESSES } from '../../constants'
import { SNAPSHOT_DELEGATION_URL } from '../../entities/Snapshot/constants'
import useDelegatesInfo from '../../hooks/useDelegatesInfo'
import Candidates from '../../modules/delegates/candidates.json'
import { Candidate } from '../Modal/VotingPowerDelegationModal/VotingPowerDelegationModal'

interface Props {
  address: string
  isUserDelegate?: boolean
  openModal: () => void
  setCandidate: React.Dispatch<React.SetStateAction<Candidate | null>>
}

function DelegateVPAction({ address, isUserDelegate, openModal, setCandidate }: Props) {
  const t = useFormatMessage()
  const text = t(
    isUserDelegate ? 'modal.vp_delegation.revoke_delegation_button' : 'page.profile.delegators.delegate_action'
  )

  const isCandidate = useMemo(() => CANDIDATE_ADDRESSES.includes(address.toLowerCase()), [address])
  const delegates = useDelegatesInfo(CANDIDATE_ADDRESSES)

  useEffect(() => {
    if (isCandidate) {
      const delegateInfo = delegates.find((delegate) => delegate.address === address.toLowerCase())
      setCandidate({
        ...delegateInfo!,
        ...Candidates.find((candidate) => candidate.address === address.toLowerCase())!,
      })
    }
  }, [address, delegates, isCandidate, setCandidate])

  if (isCandidate) {
    return <Anchor onClick={openModal}>{text}</Anchor>
  }

  return <Anchor href={`${SNAPSHOT_DELEGATION_URL}/${address}`}>{text}</Anchor>
}

export default DelegateVPAction
