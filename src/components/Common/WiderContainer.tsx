import classNames from 'classnames'
import { Container, ContainerProps } from 'decentraland-ui/dist/components/Container/Container'

import './WiderContainer.css'

export default function WiderContainer({ className, ...props }: ContainerProps) {
  return <Container className={classNames('WiderContainer', className)} {...props} />
}
