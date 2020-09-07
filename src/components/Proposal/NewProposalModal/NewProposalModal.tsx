import React from 'react'
import { Props } from './NewProposalModal.types'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import './NewProposalModal.css'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

const ban = require('../../../images/ban-name-220.png')
const catalyst = require('../../../images/catalyst-220.png')
const poi = require('../../../images/poi-220.png')
const question = require('../../../images/question-220.png')

export default class NewProposalModal extends React.PureComponent<Props, any> {

  handleClose = () => this.props.onChangeParams({})

  handleCreateQuestion = (event: React.MouseEvent<any>) => {
    event.preventDefault()
    this.props.onChangeParams({
      modal: 'new',
      create: 'question'
    })
  }

  handleCreatePoi = (event: React.MouseEvent<any>) => {
    event.preventDefault()
    this.props.onChangeParams({
      modal: 'new',
      create: 'poi'
    })
  }

  handleCreateCatalyst = (event: React.MouseEvent<any>) => {
    event.preventDefault()
    this.props.onChangeParams({
      modal: 'new',
      create: 'catalyst'
    })
  }

  handleCreateBan = (event: React.MouseEvent<any>) => {
    event.preventDefault()
    this.props.onChangeParams({
      modal: 'new',
      create: 'ban'
    })
  }

  handleBack = () => {
    const step = this.getStep()
    if (step === 3) {
      this.props.onChangeParams({
        modal: this.props.params.modal,
        create: this.props.params.create
      })
    } else if (step === 2) {
      this.props.onChangeParams({
        modal: this.props.params.modal
      })
    } else {
      this.props.onChangeParams({})
    }
  }

  getStep() {
    if (
      this.props.params.position ||
      this.props.params.banName ||
      this.props.params.question ||
      (
        this.props.params.catalystOwner &&
        this.props.params.catalystUrl
      )
    ) {
      return 3
    } else if (this.props.params.create) {
      return 2
    } else if (this.props.params.modal) {
      return 1
    } else {
      return 0
    }
  }

  render() {
    const step = this.getStep()
    return <Modal className="NewProposalModal" open={!!step} onClose={this.handleClose}>
      <Icon name="close" onClick={this.handleClose} />
      {step > 1 && <Icon name="chevron left" onClick={this.handleBack} />}
      <div className="NewProposalModalStepsContainer">
          <div className="NewProposalModalSteps" style={{ transform: `translateX(${(step - 1) * -100}%)` }}>
            <Modal.Content className="NewProposalModalStep">
                <Modal.Header><Header>{t('proposal_modal.title')}</Header></Modal.Header>
                <a onClick={this.handleCreateQuestion} style={{ backgroundImage: `url(${question})` }}>{t('proposal_modal.title_question')}</a>
                <a onClick={this.handleCreateCatalyst} style={{ backgroundImage: `url(${catalyst})` }}>{t('proposal_modal.title_catalyst')}</a>
                <a onClick={this.handleCreatePoi} style={{ backgroundImage: `url(${poi})` }}>{t('proposal_modal.title_poi')}</a>
                <a onClick={this.handleCreateBan} style={{ backgroundImage: `url(${ban})` }}>{t('proposal_modal.title_ban')}</a>
            </Modal.Content>
            <Modal.Content className="NewProposalModalStep">
              <Modal.Header>
                <Header>{t('proposal_modal.title_' + (this.props.params.create || 'question'))}</Header>
              </Modal.Header>
              <Modal.Description>
                {t('proposal_modal.description_' + (this.props.params.create || 'question'))}
              </Modal.Description>
              <Modal.Description>
                <Field />
              </Modal.Description>
              <Button primary>{t('proposal_modal.confirm')}</Button>
            </Modal.Content>
            <Modal.Content className="NewProposalModalStep">
                <Modal.Header><Header>new proposal</Header></Modal.Header>
            </Modal.Content>
          </div>
          </div>
        <div className="NewProposalModalState">
          {Array.from(new Array(3), (_, i) => <div key={i} className={step > i ? 'active' : ''} />)}
        </div>
    </Modal>
  }
}
