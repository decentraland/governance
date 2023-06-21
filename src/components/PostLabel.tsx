import React from 'react'

import Text from './Common/Text/Text'

interface Props {
  children: string
}

export default function PostLabel({ children }: Props) {
  return (
    <Text size="sm" color="secondary" weight="semi-bold" style="italic">
      {children}
    </Text>
  )
}
