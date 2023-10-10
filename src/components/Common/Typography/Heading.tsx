import classNames from 'classnames'

import './Heading.css'
import { FontSize, FontWeight } from './Text'

type HeadingTypes = 'h1' | 'h3'

type Props = React.HTMLAttributes<HTMLHeadingElement> & {
  className?: string
  as?: HeadingTypes
  size?: FontSize | '2xs'
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
