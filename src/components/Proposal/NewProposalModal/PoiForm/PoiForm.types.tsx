import React from 'react'

export type Value = {
  x: number,
  y: number
}

export type Props = {
  defaultValue?: Partial<Value>
  onConfirm?: (event: React.MouseEvent<any>, value: Value) => any
}

export type State = {
  x?: string | number,
  y?: string | number,
  error?: string
}
