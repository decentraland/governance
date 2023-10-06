import useFormatMessage from '../../hooks/useFormatMessage'
import Empty from '../Common/Empty'
import Scale from '../Icon/Scale'
import VotingPowerDelegationHandler from '../Modal/VotingPowerDelegationDetail/VotingPowerDelegationHandler'

interface Props {
  userVp: number
  profileAddress: string
}

export function DelegatedToAddressEmptyCard({ userVp, profileAddress }: Props) {
  const t = useFormatMessage()

  return (
    <Empty
      className="DelegationsCards__EmptyContainer"
      icon={<Scale />}
      title={t(`delegation.delegated_to_address_empty_title`)}
      description={t('delegation.delegated_to_address_empty_description')}
    >
      <div className="DelegationsCards__EmptyContainerButton">
        <VotingPowerDelegationHandler
          buttonText={t('delegation.delegated_to_address_empty_action')}
          userVP={userVp}
          candidateAddress={profileAddress}
          vertical
        />
      </div>
    </Empty>
  )
}
