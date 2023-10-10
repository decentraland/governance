import classNames from 'classnames'

import { PillColor } from '../Common/Pill'

import './HeroBanner.css'

export default function HeroBanner(props: { proposalActive: boolean; color: PillColor }) {
  return (
    <>
      <div
        className={classNames(
          'HeroBanner',
          props.proposalActive && `HeroBanner--${props.color}`,
          !props.proposalActive && 'HeroBanner--finished'
        )}
      ></div>
      {props.proposalActive && (
        <div className={classNames('HeroBanner', 'HeroBanner__Gradient', `HeroBanner__Gradient--${props.color}`)} />
      )}
    </>
  )
}
