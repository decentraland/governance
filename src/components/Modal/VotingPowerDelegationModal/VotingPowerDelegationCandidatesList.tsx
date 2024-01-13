import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { CANDIDATE_ADDRESSES } from '../../../constants'
import { EDIT_DELEGATE_SNAPSHOT_URL } from '../../../entities/Proposal/utils'
import useDelegatesInfo, { Delegate } from '../../../hooks/useDelegatesInfo'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useVotingPowerDistribution from '../../../hooks/useVotingPowerDistribution'
import Link from '../../Common/Typography/Link'
import Markdown from '../../Common/Typography/Markdown'
import DelegatesTable from '../../Delegation/DelegatesTable'

import './VotingPowerDelegationCandidatesList.css'

type Props = Omit<ModalProps, 'children'> & {
  setSelectedCandidate: (candidate: Candidate) => void
  showPickOtherDelegateButton?: boolean
}

export type Candidate = Delegate & {
  bio: string
  links: string[]
  relevant_skills: string[]
  involvement: string
  motivation: string
  vision: string
  most_important_issue: string
}

function VotingPowerDelegationCandidatesList({
  onClose,
  setSelectedCandidate,
  showPickOtherDelegateButton,
  ...props
}: Props) {
  const delegates = useDelegatesInfo(CANDIDATE_ADDRESSES)
  const [userAddress] = useAuthContext()
  const { vpDistribution } = useVotingPowerDistribution(userAddress)

  const t = useFormatMessage()

  return (
    <Modal
      {...props}
      onClose={onClose}
      size="small"
      closeIcon={<Close />}
      className="GovernanceContentModal VotingPowerDelegationCandidatesList"
    >
      <Modal.Header className="VotingPowerDelegationCandidatesList__Header">
        {t('modal.vp_delegation.title')}
      </Modal.Header>
      <Modal.Description className="VotingPowerDelegationCandidatesList__Description">
        <Markdown componentsClassNames={{ a: 'VotingPowerDelegationCandidatesList__DescriptionLink' }}>
          {(userAddress && vpDistribution
            ? t('modal.vp_delegation.description', { vp: vpDistribution.own })
            : t('modal.vp_delegation.description_generic')) + t('modal.vp_delegation.read_more')}
        </Markdown>
      </Modal.Description>
      <Modal.Content>
        <DelegatesTable delegates={delegates} setSelectedCandidate={setSelectedCandidate} full />
      </Modal.Content>
      {showPickOtherDelegateButton && (
        <Button
          className="VotingPowerDelegationCandidatesList__PickButton"
          fluid
          primary
          href={EDIT_DELEGATE_SNAPSHOT_URL}
          as={Link}
        >
          {t('modal.vp_delegation.pick_button')}
        </Button>
      )}
    </Modal>
  )
}

export default VotingPowerDelegationCandidatesList
