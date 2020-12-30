import React from 'react'

export type Value = {
  destination: string,
  amount: number,
  url: string
}

export type Props = {
  defaultValue?: Partial<Value>
  onConfirm?: (event: React.MouseEvent<any>, value: Value) => any
}

export type State = {
  destination?: string,
  amount?: string | number,
  url?: string,
  error?: string
}
