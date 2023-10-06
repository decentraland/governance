import classNames from 'classnames'

import useFormatMessage from '../../hooks/useFormatMessage'

import './VotingPower.css'

export type VotingPowerProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number | bigint
  size?: 'huge' | 'large' | 'medium' | 'small' | 'tiny'
  bold?: boolean
  secondary?: boolean
}

export default function VotingPower({ value, size, secondary, bold, ...props }: VotingPowerProps) {
  const t = useFormatMessage()

  return (
    <div
      {...props}
      className={classNames(
        'VotingPower',
        secondary && `VotingPower--secondary`,
        bold && `VotingPower--bold`,
        size && `VotingPower--${size}`,
        props.className
      )}
    >
      {value !== undefined && <div>{t('general.number', { value })}</div>}
      <svg width="43" height="29" viewBox="0 0 43 29" fill="none">
        <rect x="0.75" y="0.75" width="40.74" height="26.66" rx="4.53" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M16.0771 21L20.7942 7.35914H18.1946L14.7915 18.1546H14.6308L11.1993 7.35914H8.50516L13.2695 21H16.0771ZM23.1481 7.35914V21H25.587V16.5287H28.5458C31.3061 16.5287 33.2345 14.6759 33.2345 11.9723C33.2345 9.22141 31.3723 7.35914 28.6498 7.35914H23.1481ZM25.587 9.40102H28.007C29.7652 9.40102 30.7578 10.2991 30.7578 11.9723C30.7578 13.5982 29.7369 14.5057 27.9975 14.5057H25.587V9.40102Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}
