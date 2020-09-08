import React from 'react'

export type Value = string

export type Props = {
  defaultValue?: string
  onConfirm?: (event: React.MouseEvent<any>, value: Value) => any
}

export type State = {
  value?: string,
  error?: string
}
