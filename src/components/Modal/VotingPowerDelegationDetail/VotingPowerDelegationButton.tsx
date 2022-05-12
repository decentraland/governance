import React, { useState } from 'react'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import './VotingPowerDelegationButton.css'
import useSnapshotDelegateContract from '../../../hooks/useSnapshotDelegateContract'
import { EDIT_DELEGATE_SNAPSHOT_URL } from '../../../entities/Snapshot/constants'
import Info from '../../Icon/Info'

interface Props {
  candidateAddress: string
  userVP: number
}

function VotingPowerDelegationButton({ candidateAddress, userVP }: Props) {
  const t = useFormatMessage()
  const [isLoading, setLoading] = useState(false)
  const { isContractUsable, delegatedAddress, isGlobalDelegation, setDelegate, clearDelegate } =
    useSnapshotDelegateContract()

  const isRevocable = !!delegatedAddress && delegatedAddress.toLowerCase() === candidateAddress.toLowerCase()
  const isDelegatedGlobally = isRevocable && isGlobalDelegation

  const handleClick = async () => {
    setLoading(true)

    try {
      if (isRevocable) {
        await clearDelegate()
      } else {
        await setDelegate(candidateAddress)
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
          {isGlobalDelegation ? (
            <Popup
              className="GlobalDelegationPopUp"
              content={<span>{t('modal.vp_delegation.delegated_globally_helper')}</span>}
              position="bottom center"
              trigger={
                <a className="DelegateButton__Container--Global" href={EDIT_DELEGATE_SNAPSHOT_URL} target="_blank">
                  {t('modal.vp_delegation.delegated_globally')} <Info width="18px" height="18px" />
                </a>
              }
              on="hover"
            />
          ) : (
            t('modal.vp_delegation.delegated_stats', { vp: userVP })
          )}
        </Header>
      )}
      <Button
        disabled={isLoading || !isContractUsable || isDelegatedGlobally}
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
