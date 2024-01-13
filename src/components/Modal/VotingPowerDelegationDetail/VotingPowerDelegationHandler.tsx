import { useState } from 'react'

import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import { EDIT_DELEGATE_SNAPSHOT_URL } from '../../../entities/Proposal/utils'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useSnapshotDelegateContract, { DelegateContractStatusCode } from '../../../hooks/useSnapshotDelegateContract'
import Link from '../../Common/Typography/Link'
import Info from '../../Icon/Info'

import './VotingPowerDelegationHandler.css'

interface Props {
  buttonText: string
  candidateAddress: string
  userVP?: number
  basic?: boolean
  vertical?: boolean
}

function VotingPowerDelegationHandler({ buttonText, candidateAddress, userVP, basic, vertical }: Props) {
  const t = useFormatMessage()
  const [isLoading, setLoading] = useState(false)
  const [isError, setError] = useState(false)
  const [userAddress, accountState] = useAuthContext()
  const { isContractUsable, delegatedAddress, isGlobalDelegation, setDelegate, clearDelegate } =
    useSnapshotDelegateContract()

  const isRevocable = !!delegatedAddress && delegatedAddress.toLowerCase() === candidateAddress.toLowerCase()
  const isDelegatedGlobally = isRevocable && isGlobalDelegation
  const showDelegatedInfo = isRevocable && !isLoading && !isError && !accountState.loading

  const handleClick = async () => {
    setLoading(true)
    setError(false)
    try {
      if (isRevocable) {
        await clearDelegate()
      } else {
        await setDelegate(candidateAddress)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error)
      if (error.code !== DelegateContractStatusCode.TRANSACTION_CANCELED_BY_USER) {
        setError(true)
      }
    } finally {
      setLoading(false)
      location.reload()
    }
  }

  return (
    <span className={classNames('DelegateButton__Container', vertical && 'DelegateButton__VerticalDisplay')}>
      {userAddress && (
        <>
          <Header sub size="tiny">
            {isLoading && t('modal.vp_delegation.wait_helper')}
            {isError && t('modal.vp_delegation.error_helper')}
            {showDelegatedInfo &&
              (isGlobalDelegation ? (
                <Popup
                  className="GlobalDelegationPopUp"
                  content={<span>{t('modal.vp_delegation.delegated_globally_helper')}</span>}
                  position="bottom center"
                  trigger={
                    <Link className="DelegateButton__Container--Global" href={EDIT_DELEGATE_SNAPSHOT_URL}>
                      {t('modal.vp_delegation.delegated_globally')} <Info size="18" />
                    </Link>
                  }
                  on="hover"
                />
              ) : (
                t('modal.vp_delegation.delegated_stats', { vp: userVP })
              ))}
          </Header>
          <Button
            className="RevokeDelegationButton"
            disabled={isLoading || !isContractUsable || isDelegatedGlobally}
            loading={isLoading}
            inverted={isRevocable}
            primary={!basic || (basic && isRevocable)}
            basic={basic && !isRevocable}
            size="small"
            onClick={handleClick}
          >
            {isRevocable ? t('modal.vp_delegation.revoke_delegation_button') : buttonText}
          </Button>
        </>
      )}
      {!userAddress && (
        <Button
          primary={!basic}
          basic={basic}
          size="small"
          loading={accountState.loading}
          disabled={accountState.loading}
          onClick={() => accountState.select()}
        >
          {t('modal.vp_delegation.sign_in_to_delegate')}
        </Button>
      )}
    </span>
  )
}

export default VotingPowerDelegationHandler
