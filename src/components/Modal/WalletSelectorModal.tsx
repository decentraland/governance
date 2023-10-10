import { useCallback, useEffect, useState } from 'react'

import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { connection } from 'decentraland-connect/dist/ConnectionManager'
import { toModalOptionType } from 'decentraland-dapps/dist/containers/LoginModal/utils'
import useAnchor from 'decentraland-gatsby/dist/hooks/useAnchor'
import { LoginModal, LoginModalOptionType } from 'decentraland-ui/dist/components/LoginModal/LoginModal'

import useFormatMessage from '../../hooks/useFormatMessage'
import Markdown from '../Common/Typography/Markdown'

import './WalletSelectorModal.css'

type Props = {
  open: boolean
  loading: boolean
  chainId: ChainId
  error: string | null
  onConnect: (providerType: ProviderType, chainId: ChainId) => void
  onClose: () => void
}

const availableProviders = new Set(connection.getAvailableProviders())

export default function WalletSelectorModal({ chainId, onConnect, onClose, error, open, loading }: Props) {
  const t = useFormatMessage()
  const [provider, setProvider] = useState(LoginModalOptionType.METAMASK)

  useEffect(() => {
    setProvider(toModalOptionType(ProviderType.INJECTED) || LoginModalOptionType.METAMASK)
  }, [])

  const handleConnect = useCallback(
    (providerType: ProviderType, chainId: ChainId) => {
      if (onConnect) {
        onConnect(providerType, chainId)
      }
    },
    [onConnect]
  )

  const handleDownloadMetamaskClick = useAnchor('https://metamask.io/download.html')
  const handleConnectInjected = useCallback(() => {
    if (availableProviders.has(ProviderType.INJECTED)) {
      handleConnect(ProviderType.INJECTED, chainId)
    } else {
      handleDownloadMetamaskClick()
    }
  }, [handleConnect, handleDownloadMetamaskClick, chainId])
  const handleConnectFortmatic = useCallback(
    () => handleConnect(ProviderType.FORTMATIC, chainId),
    [chainId, handleConnect]
  )
  const handleConnectWalletConnect = useCallback(
    () => handleConnect(ProviderType.WALLET_CONNECT_V2, chainId),
    [chainId, handleConnect]
  )
  const handleConnectWalletLink = useCallback(
    () => handleConnect(ProviderType.WALLET_LINK, chainId),
    [chainId, handleConnect]
  )

  return (
    <LoginModal
      open={open}
      onClose={onClose}
      className="WalletSelectorModal"
      message={
        <Markdown componentsClassNames={{ p: 'WalletSelectorModal__Text' }}>
          {t('modal.wallet_selector.trezor')}
        </Markdown>
      }
      hasError={!!error}
      loading={loading}
    >
      <LoginModal.Option type={provider} onClick={handleConnectInjected} />
      {availableProviders.has(ProviderType.FORTMATIC) && (
        <LoginModal.Option type={LoginModalOptionType.FORTMATIC} onClick={handleConnectFortmatic} />
      )}
      {availableProviders.has(ProviderType.WALLET_CONNECT) && (
        <LoginModal.Option type={LoginModalOptionType.WALLET_CONNECT} onClick={handleConnectWalletConnect} />
      )}
      {availableProviders.has(ProviderType.WALLET_LINK) && (
        <LoginModal.Option type={LoginModalOptionType.WALLET_LINK} onClick={handleConnectWalletLink} />
      )}
      {error && <p className="error visible">{error}</p>}
    </LoginModal>
  )
}
