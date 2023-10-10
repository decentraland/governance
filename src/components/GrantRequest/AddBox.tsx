import classNames from 'classnames'

import AddPrimary from '../Icon/AddPrimary'
import OutlineDots from '../Icon/OutlineDots'

import './AddBox.css'

interface Props {
  children: React.ReactText
  onClick: () => void
  disabled?: boolean
}

const AddBox = ({ children, onClick, disabled }: Props) => {
  const Icon = disabled ? OutlineDots : AddPrimary

  return (
    <button disabled={disabled} className={classNames('AddBox', disabled && 'AddBox--disabled')} onClick={onClick}>
      <Icon className="AddBox__Icon" />
      <span>{children}</span>
    </button>
  )
}

export default AddBox
