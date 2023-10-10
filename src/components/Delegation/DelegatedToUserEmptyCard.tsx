import useFormatMessage from '../../hooks/useFormatMessage'
import Empty from '../Common/Empty'
import Scale from '../Icon/Scale'

export function DelegatedToUserEmptyCard() {
  const t = useFormatMessage()
  return (
    <Empty
      className="DelegationsCards__EmptyContainer"
      icon={<Scale />}
      title={t(`delegation.delegated_to_user_empty_title`)}
      description={t('delegation.delegated_to_user_empty_description')}
    />
  )
}
