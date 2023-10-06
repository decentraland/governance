import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

import useFormatMessage from '../../../hooks/useFormatMessage'
import DotsMenu from '../../Icon/DotsMenu'

import './UpdateMenu.css'

interface Props {
  onEditClick: () => void
  onDeleteClick: () => void
}

const UpdateMenu = ({ onEditClick, onDeleteClick }: Props) => {
  const t = useFormatMessage()

  const handleDropdownClick = (e: React.MouseEvent<HTMLElement>) => e.preventDefault()

  return (
    <Dropdown onClick={handleDropdownClick} className="UpdateMenu" icon={<DotsMenu />} direction="left">
      <Dropdown.Menu>
        <Dropdown.Item text={t('modal.edit_update.action')} onClick={onEditClick} />
        <Dropdown.Item text={t('modal.delete_update.accept')} onClick={onDeleteClick} />
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default UpdateMenu
