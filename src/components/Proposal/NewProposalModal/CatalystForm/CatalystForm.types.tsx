import React from 'react'

export type Value = {
  owner: string,
  url: string
}

export type Props = {
  defaultValue?: Partial<Value>
  onConfirm?: (event: React.MouseEvent<any>, value: Value) => any
}

export type State = {
  owner?: string,
  url?: string,
  error?: string
}
