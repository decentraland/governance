import classNames from 'classnames'

type ListItemProps = React.LiHTMLAttributes<HTMLLIElement>

export function ListItem(props: ListItemProps) {
  return <li {...props} className={classNames('ListItem', props.className)} />
}
