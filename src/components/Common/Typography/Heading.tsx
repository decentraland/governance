import classNames from 'classnames'

import './Heading.css'
import { FontWeight } from './Text'

type HeadingTypes = 'h1' | 'h3'

type Props = React.HTMLAttributes<HTMLHeadingElement> & {
  className?: string
  as?: HeadingTypes
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  weight?: FontWeight
}

export default function Heading({ as, size = 'lg', weight = 'bold', className, ...props }: Props) {
  const Component = as ?? 'h2'
  return (
    <Component
      {...props}
      className={classNames('Heading', `Heading--${size}`, `Heading--weight-${weight}`, className)}
    />
  )
}
