import { BigNumber } from 'ethers'

export type Props = {
  value?: number | bigint | BigNumber
  size?: 'huge' | 'large' | 'medium' | 'small' | 'tiny',
  secondary?: boolean
}
