import React from 'react'
import { Props } from './NewProposalModal.types'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import './NewProposalModal.css'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import PoiForm from './PoiForm'
import BanForm from './BanForm/BanForm'
import QuestionForm from './QuestionForm/QuestionForm'
import CatalystForm from './CatalystForm/CatalystForm'
import { isValidPosition } from './utils'
import { NewProposalParams } from 'routing/types'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'

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

  addParams(options: NewProposalParams = {}) {
    this.props.onChangeParams({
      ...this.props.params,
      ...options
    })
  }

  getPosition() {
    let [x, y] = (this.props.params.position || '')
      .split(',')
      .slice(0, 2)
      .filter(isValidPosition)
      .map(Number) as (number | undefined)[]

    return { x, y }
  }

  getBan() {
    return this.props.params.banName || undefined
  }

  getQuestion() {
    return this.props.params.question || undefined
  }

  getCatalyst() {
    const owner = this.props.params.catalystOwner || undefined
    const url = this.props.params.catalystUrl || undefined
    return { owner, url }
  }

  getStep() {
    const position = this.getPosition()
    const catalyst = this.getCatalyst()
    if (
      this.getBan() !== undefined ||
      this.getQuestion() !== undefined ||
      (position.x !== undefined && position.y !== undefined) ||
      (catalyst.owner !== undefined && catalyst.url !== undefined)
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

  renderOptions() {
    return <Modal.Content className="NewProposalModalStep">
      <Modal.Header><Header>{t('proposal_modal.title')}</Header></Modal.Header>
      <a onClick={this.handleCreateQuestion} style={{ backgroundImage: `url(${question})` }}>{t('proposal_modal.title_question')}</a>
      <a onClick={this.handleCreateCatalyst} style={{ backgroundImage: `url(${catalyst})` }}>{t('proposal_modal.title_catalyst')}</a>
      <a onClick={this.handleCreatePoi} style={{ backgroundImage: `url(${poi})` }}>{t('proposal_modal.title_poi')}</a>
      <a onClick={this.handleCreateBan} style={{ backgroundImage: `url(${ban})` }}>{t('proposal_modal.title_ban')}</a>
    </Modal.Content>
  }

  renderForm() {
    switch (this.props.params.create) {
      case "question":
        return <QuestionForm defaultValue={this.getQuestion()} onConfirm={(_, question) => this.addParams({ question })} />
      case "catalyst":
        return <CatalystForm defaultValue={this.getCatalyst()} onConfirm={(_, { owner, url }) => this.addParams({ catalystOwner: owner, catalystUrl: url })} />
      case "poi":
        return <PoiForm defaultValue={this.getPosition()} onConfirm={(_, { x, y }) => this.addParams({ position: [x,y].join(',') })} />
      case "ban":
        return <BanForm defaultValue={this.getBan()} onConfirm={(_, banName) => this.addParams({ banName })} />
      default:
        return this.renderEmpty()
    }
  }

  renderConfirm() {
    switch (this.props.params.create) {
      case "question":
        return this.renderConfirmQuestion()
      case "catalyst":
        return this.renderConfirmCatalyst()
      case "poi":
        return this.renderConfirmPoi()
      case "ban":
        return this.renderConfirmBan()
      default:
        return this.renderEmpty()
    }
  }

  renderConfirmQuestion() {
    const question = this.getQuestion()
    return <Modal.Content className="NewProposalModalStep">
      <Modal.Header>
        <Header>{t('proposal_modal.title_question')}</Header>
      </Modal.Header>
      <Modal.Description>
        {t('proposal_modal.confirm_question', { question: <b>{question}</b> })}
      </Modal.Description>
      <Button primary>{t('proposal_modal.confirm')}</Button>
    </Modal.Content>
  }

  renderConfirmCatalyst() {
    const { url, owner } = this.getCatalyst()
    return <Modal.Content className="NewProposalModalStep">
      <Modal.Header>
        <Header>{t('proposal_modal.title_catalyst')}</Header>
      </Modal.Header>
      <Modal.Description>
        {t('proposal_modal.confirm_catalyst', {
          url: <b>{url}</b>,
          owner: <Blockie scale={3} seed={owner!}>
          <Address value={owner!} strong />
        </Blockie>,
          catalyst: <b>Catalyst Server</b>
        })}
      </Modal.Description>
      <Button primary>{t('proposal_modal.confirm')}</Button>
    </Modal.Content>
  }

  renderConfirmPoi() {
    const { x, y } = this.getPosition()
    return <Modal.Content className="NewProposalModalStep">
      <Modal.Header>
        <Header>{t('proposal_modal.title_poi')}</Header>
      </Modal.Header>
      <Modal.Description>
        {t('proposal_modal.confirm_poi', {
          position: <b>{x},{y}</b>,
          poi: <b>{t('proposal_modal.title_poi')}</b>
        })}
      </Modal.Description>
      <Button primary>{t('proposal_modal.confirm')}</Button>
    </Modal.Content>
  }

  renderConfirmBan() {
    const name = this.getBan()
    return <Modal.Content className="NewProposalModalStep">
      <Modal.Header>
        <Header>{t('proposal_modal.title_ban')}</Header>
      </Modal.Header>
      <Modal.Description>
        {t('proposal_modal.confirm_ban', { name })}
      </Modal.Description>
      <Button primary>{t('proposal_modal.confirm')}</Button>
    </Modal.Content>
  }

  renderEmpty() {
    return <Modal.Content className="NewProposalModalStep"></Modal.Content>
  }

  render() {
    const step = this.getStep()
    return <Modal className="NewProposalModal" open={step > 0} onClose={this.handleClose}>
      <Icon name="close" onClick={this.handleClose} />
      {step > 1 && <Icon name="chevron left" onClick={this.handleBack} />}
      <div className="NewProposalModalStepsContainer">
        <div
          className="NewProposalModalSteps"
          style={{ transform: `translateX(${(step - 1) * -100}%)` }}
        >
          {this.renderOptions()}
          {this.renderForm()}
          {this.renderConfirm()}
        </div>
      </div>
    </Modal>
  }
}
