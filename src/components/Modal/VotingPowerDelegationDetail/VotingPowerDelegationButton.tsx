import React, { useState } from 'react'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import './VotingPowerDelegationButton.css'

interface Props {
  delegatedAddress: string | undefined
  candidateAddress: string
  isGlobalDelegation: boolean
  disabled: boolean
  userVP: number
  onRevoke: () => Promise<void>
  onDelegate: (candidateAddress: string) => Promise<void>
}

function VotingPowerDelegationButton({
  delegatedAddress,
  candidateAddress,
  isGlobalDelegation,
  userVP,
  disabled,
  onRevoke,
  onDelegate,
}: Props) {
  const t = useFormatMessage()
  const [isLoading, setLoading] = useState(false)

  const isRevocable = !!delegatedAddress && delegatedAddress.toLowerCase() === candidateAddress.toLowerCase()
  const isDelegatedGlobally = isRevocable && isGlobalDelegation

  const handleClick = async () => {
    setLoading(true)

    try {
      if (isRevocable) {
        await onRevoke()
      } else {
        await onDelegate(candidateAddress)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <span className="DelegateButton__Container">
      {isRevocable && (
        <Header sub size="tiny">
          {isGlobalDelegation
            ? t('modal.vp_delegation.delegated_globally')
            : t('modal.vp_delegation.delegated_stats', { vp: userVP })}
        </Header>
      )}
      <Button
        disabled={isLoading || disabled || isDelegatedGlobally}
        loading={isLoading}
        inverted={isRevocable}
        primary
        size="small"
        onClick={handleClick}
      >
        {isRevocable ? t('modal.vp_delegation.revoke_delegation_button') : t('modal.vp_delegation.delegate_button')}
      </Button>
    </span>
  )
}

export default VotingPowerDelegationButton
