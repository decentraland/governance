import { BigNumber } from 'ethers'

export type Props = {
  value?: number | bigint | BigNumber
  symbol?: 'MANA' | 'VP'
  size?: 'huge' | 'large' | 'medium' | 'small' | 'tiny',
  secondary?: boolean
}
