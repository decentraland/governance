import React from 'react'
import { Props } from './ProposalSupportModal.types'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import './ProposalSupportModal.css'
import { getVoteUrl } from 'modules/vote/utils'

export default class ProposalSupportModal extends React.PureComponent<Props, {}> {

  handleProceed = () => {
    if (this.props.vote && !this.props.isCreating) {
      const vote = this.props.vote
      this.props.onCreateCast(vote.id, this.isSupporting())
    }
  }

  handleClose = () => {
    if (this.props.vote && !this.props.isCreating) {
      this.props.onNavigate(getVoteUrl(this.props.vote))
    }
  }

  isSupporting() {
    return String(this.props.params?.support) !== 'false'
  }

  isOpen() {
    return !!this.props.vote && this.props.params.modal === 'vote'
  }

  render() {
    const { completed } = this.props.params
    return <Modal className="ProposalSupportModal" open={this.isOpen()} onClose={this.handleClose}>
      <Icon name="close" onClick={this.handleClose} />
      <Modal.Content>
        <Modal.Header><Header>{t('proposal_support_modal.title')}</Header></Modal.Header>
        {!completed && <Modal.Description><span>
          {t('proposal_support_modal.description', {
            support: <b>{this.isSupporting() ? t('proposal_support_modal.favor') : t('proposal_support_modal.against')}</b>
          })}
        </span></Modal.Description>}
        {!completed && <Modal.Actions><div>
          <Button
            primary
            disabled={this.props.isConnecting || this.props.isCreating}
            loading={this.props.isConnecting || this.props.isCreating}
            onClick={this.handleProceed}
          >{t('general.proceed')}</Button>
          <Button onClick={this.handleClose}>{t('general.close')}</Button>
          </div></Modal.Actions>}
        {completed && <Modal.Description>{t('proposal_support_modal.confirm')}</Modal.Description>}
        {completed && <Modal.Actions>
          <Button onClick={this.handleClose}>{t('general.close')}</Button>
        </Modal.Actions>}
      </Modal.Content>
    </Modal>
  }
}
