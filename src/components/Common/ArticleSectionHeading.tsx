import Heading from './Typography/Heading'

import './ArticleSectionHeading.css'

interface Props {
  children: React.ReactText
}

export default function ArticleSectionHeading({ children }: Props) {
  return (
    <Heading className="ArticleSectionHeading" size="3xs" weight="semi-bold">
      {children}
    </Heading>
  )
}
