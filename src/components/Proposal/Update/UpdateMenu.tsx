import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

import { useAuthContext } from '../../../front/context/AuthProvider'
import useFormatMessage from '../../../hooks/useFormatMessage'
import DotsMenu from '../../Icon/DotsMenu'

import './UpdateMenu.css'

interface Props {
  author?: string
  onEditClick: () => void
  onDeleteClick: () => void
}

const UpdateMenu = ({ author, onEditClick, onDeleteClick }: Props) => {
  const [account] = useAuthContext()
  const t = useFormatMessage()

  const handleDropdownClick = (e: React.MouseEvent<HTMLElement>) => e.preventDefault()

  return (
    <Dropdown onClick={handleDropdownClick} className="UpdateMenu" icon={<DotsMenu />} direction="left">
      <Dropdown.Menu>
        {!!author && author === account && <Dropdown.Item text={t('modal.edit_update.action')} onClick={onEditClick} />}
        <Dropdown.Item text={t('modal.delete_update.accept')} onClick={onDeleteClick} />
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default UpdateMenu
