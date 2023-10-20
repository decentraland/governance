import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { CatalystType, HiringType, PoiType, ProposalType } from '../../../entities/Proposal/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import locations from '../../../utils/locations'
import CategoryBanner from '../../Category/CategoryBanner'
import Text from '../../Common/Typography/Text'
import '../ProposalModal.css'

type AcceptedProposalType = ProposalType.POI | ProposalType.Hiring | ProposalType.Catalyst

export type AddRemoveProposalModalProps = ModalProps & {
  title: AcceptedProposalType
  proposalType: AcceptedProposalType
  addType: PoiType | HiringType | CatalystType
  isAddDisabled?: boolean
  removeType: PoiType | HiringType | CatalystType
  isRemoveDisabled?: boolean
}

export function AddRemoveProposalModal({
  title,
  proposalType,
  addType,
  isAddDisabled,
  removeType,
  isRemoveDisabled,
  ...props
}: AddRemoveProposalModalProps) {
  const t = useFormatMessage()
  const addHref = locations.submit(proposalType, { request: addType })
  const removeHref = locations.submit(proposalType, { request: removeType })

  return (
    <Modal {...props} size="tiny" className="GovernanceContentModal ProposalModal" closeIcon={<Close />}>
      <Modal.Content>
        <div className="ProposalModal__Title">
          <Header>{t(`category.${title}_title`)}</Header>
          <Text size="lg">{t('modal.poi_proposal.description')}</Text>
        </div>
      </Modal.Content>
      <div className="ProposalModel__Actions">
        <CategoryBanner type={addType} href={addHref} active={!isAddDisabled} />
        <CategoryBanner type={removeType} href={removeHref} active={!isRemoveDisabled} />
      </div>
    </Modal>
  )
}
