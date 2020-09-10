import React from 'react'

export type Props = Omit<React.HTMLProps<HTMLInputElement>, 'type'>

export type State = Pick<Props, 'value'>
