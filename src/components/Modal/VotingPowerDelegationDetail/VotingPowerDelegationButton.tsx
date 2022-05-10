import React from 'react'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import './VotingPowerDelegationButton.css'

interface Props {
  revoke: boolean
  disabled: boolean
  loading: boolean
  userVP: number
  onRevoke: () => void
  onDelegate: () => void
}

function VotingPowerDelegationButton({ revoke, userVP, disabled, loading, onRevoke, onDelegate }: Props) {
  const t = useFormatMessage()
  return (
    <span className="DelegateButton__Container">
      {revoke && (
        <Header sub size="tiny">
          {t('modal.vp_delegation.delegated_stats', { VP: userVP })}
        </Header>
      )}
      <Button
        disabled={disabled}
        loading={loading}
        inverted={revoke}
        primary
        size="small"
        onClick={revoke ? onRevoke : onDelegate}
      >
        {revoke ? t('modal.vp_delegation.revoke_delegation_button') : t('modal.vp_delegation.delegate_button')}
      </Button>
    </span>
  )
}

export default VotingPowerDelegationButton
