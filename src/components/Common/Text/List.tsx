import React from 'react'

import classNames from 'classnames'

import './List.css'

export type ListProps = (React.HTMLAttributes<HTMLUListElement> | React.HTMLAttributes<HTMLOListElement>) & {
  ordered?: boolean
  depth?: number
}

export default function List(props: ListProps) {
  if (props.ordered) {
    return <ol {...props} className={classNames('List', props.className)} />
  } else {
    return <ul {...props} className={classNames('List', props.className)} />
  }
}

export type ListItem = React.LiHTMLAttributes<HTMLLIElement>

export function ListItem(props: ListItem) {
  return <li {...props} className={classNames('ListItem', props.className)} />
}
