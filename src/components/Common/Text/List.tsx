import React from 'react'

import classNames from 'classnames'

import './List.css'

type ListProps = (React.HTMLAttributes<HTMLUListElement> | React.HTMLAttributes<HTMLOListElement>) & {
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

type ListItemProps = React.LiHTMLAttributes<HTMLLIElement>

export function ListItem(props: ListItemProps) {
  return <li {...props} className={classNames('ListItem', props.className)} />
}
