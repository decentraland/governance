import { useMemo } from 'react'

import { ChainId, getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { ModalNavigation } from 'decentraland-ui/dist/components/ModalNavigation/ModalNavigation'

import useFormatMessage from '../../hooks/useFormatMessage'

type Props = {
  currentNetwork: ChainId | null
  expectedNetworks: ChainId[]
  onSwitchNetwork: (chainId: ChainId) => void
  providerType: ProviderType | null
}

export default function WrongNetworkModal({ currentNetwork, expectedNetworks, onSwitchNetwork, providerType }: Props) {
  const t = useFormatMessage()

  const isOpen = useMemo(
    () => !!currentNetwork && !expectedNetworks.includes(currentNetwork),
    [currentNetwork, expectedNetworks]
  )

  const expectedChainName = useMemo(() => {
    switch (expectedNetworks.length) {
      case 0:
        return <b />
      case 1:
        return <b>{getChainName(expectedNetworks[0])}</b>
      default:
        return (
          <span>
            {expectedNetworks.map((chainId, i, list) => (
              <span key={chainId}>
                <b>{getChainName(chainId)}</b>
                {i === list.length - 1 ? ', ' : t('modal.wrong_network.separator')}
              </span>
            ))}
          </span>
        )
    }
  }, [t, expectedNetworks])

  const chainName = currentNetwork ? getChainName(currentNetwork) : undefined
  const currentChainName = <b>{chainName || t('modal.wrong_network.unknown_chain')}</b>

  const allowNetworkSwitch = providerType === ProviderType.INJECTED

  return (
    <Modal size="tiny" open={isOpen}>
      <ModalNavigation title={t('modal.wrong_network.header')} />
      <Modal.Content>
        {t('modal.wrong_network.message', {
          currentChainName,
          expectedChainName,
        })}
      </Modal.Content>
      {allowNetworkSwitch && expectedNetworks.length > 0 && (
        <Modal.Content>
          {expectedNetworks.map((chainId: ChainId, index: number) => {
            return (
              <Button
                fluid
                key={chainId}
                basic={index !== 0}
                primary={index === 0}
                style={index === 0 ? {} : { marginTop: '1em' }}
                onClick={() => onSwitchNetwork && onSwitchNetwork(chainId)}
              >
                {t('modal.wrong_network.change_chain', {
                  expectedChainName: <b>{getChainName(chainId)}</b>,
                })}
              </Button>
            )
          })}
        </Modal.Content>
      )}
    </Modal>
  )
}
