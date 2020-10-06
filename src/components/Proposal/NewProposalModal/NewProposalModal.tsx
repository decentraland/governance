import React from 'react'
import { Helmet } from 'react-helmet'
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
import { isValidPosition, isValidName } from './utils'
import { FilterProposalParams, NewProposalParams } from 'routing/types'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'
import { locations } from 'routing/locations'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

const signIn = require('../../../images/sign-in.svg')
const ban = require('../../../images/ban-name-220.png')
const catalyst = require('../../../images/catalyst-220.png')
const poi = require('../../../images/poi-220.png')
// const question = require('../../../images/question-220.png')

export default class NewProposalModal extends React.PureComponent<Props, any> {

  getUrl(options: NewProposalParams = {}) {
    return locations.root({
      ...{
        status: this.props.params.status
      } as FilterProposalParams,
      ...options
    })
  }

  handleChangeParams = (options: NewProposalParams = {}) => {
    this.props.onNavigate(this.getUrl(options))
  }

  handleNavigate = (event: React.MouseEvent<any>) => {
    event.preventDefault()
    if (event.currentTarget.getAttribute('href')) {
      this.props.onNavigate(event.currentTarget.getAttribute('href'))
    }
  }

  handleWrap = () => {
    if (!this.props.isCreating) {
      this.props.onNavigate(locations.wrapping({}))
    }
  }

  handleClose = () => {
    if (!this.props.isCreating) {
      this.handleChangeParams({})
    }
  }

  handleBack = () => {
    const step = this.getStep()
    if (step === 3) {
      this.handleChangeParams({
        modal: this.props.params.modal,
        create: this.props.params.create
      })
    } else if (step === 2) {
      this.handleChangeParams({
        modal: this.props.params.modal
      })
    } else {
      this.handleChangeParams({})
    }
  }

  addParams(options: NewProposalParams = {}) {
    this.handleChangeParams({
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
    if (isValidName(this.props.params.banName)) {
      return this.props.params.banName!
    }

    return undefined
  }

  getQuestion() {
    if (this.props.params.question) {
      return this.props.params.question
    }

    return undefined
  }

  getCatalyst() {
    const owner = this.props.params.catalystOwner || undefined
    const url = this.props.params.catalystUrl || undefined
    return { owner, url }
  }

  getStep() {
    const { isConnected, isConnecting, wallet } = this.props
    if (
      this.props.params.modal &&
      (!isConnected || isConnecting || !(wallet?.manaMiniMe))
    ) {
      return 1
    }

    const position = this.getPosition()
    const catalyst = this.getCatalyst()
    if (
      this.getBan() !== undefined ||
      this.getQuestion() !== undefined ||
      (position.x !== undefined && position.y !== undefined) ||
      (catalyst.owner !== undefined && catalyst.url !== undefined)
    ) {
      if (this.props.params.completed) {
        return 4
      }

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
      <Helmet title={t('seo.title_extended', { title: t('proposal_modal.title') })} />
      <Modal.Header><Header>{t('proposal_modal.title')}</Header></Modal.Header>
      {/* <a onClick={this.handleNavigate} href={this.getUrl({ modal: 'new', create: 'question' })} style={{ backgroundImage: `url(${question})` }}>{t('proposal_modal.title_question')}</a> */}
      <a className="full" onClick={this.handleNavigate} href={this.getUrl({ modal: 'new', create: 'poi' })} style={{ backgroundImage: `url(${poi})` }}>{t('proposal_modal.title_poi')}</a>
      <a onClick={this.handleNavigate} href={this.getUrl({ modal: 'new', create: 'catalyst' })} style={{ backgroundImage: `url(${catalyst})` }}>{t('proposal_modal.title_catalyst')}</a>
      <a onClick={this.handleNavigate} href={this.getUrl({ modal: 'new', create: 'ban' })} style={{ backgroundImage: `url(${ban})` }}>{t('proposal_modal.title_ban')}</a>
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

  handleConfirmQuestion = () => {
    const question = this.getQuestion()
    if (question) {
      this.props.onCreateQuestion(question)
    }
  }

  renderConfirmQuestion() {
    const question = this.getQuestion()
    if (question === undefined) {
      return this.renderEmpty()
    }

    return <Modal.Content className="NewProposalModalStep">
      <Modal.Header>
        <Header>{t('proposal_modal.title_question')}</Header>
      </Modal.Header>
      <Modal.Description>
        {t('proposal_modal.confirm_question', { question: <b>{question}</b> })}
      </Modal.Description>
      <Button primary loading={this.props.isCreating} onClick={this.handleConfirmQuestion}>{t('proposal_modal.confirm')}</Button>
    </Modal.Content>
  }

  handleConfirmCatalyst = () => {
    const { url, owner } = this.getCatalyst()
    if (owner && url) {
      this.props.onCreateCatalyst(owner, url)
    }
  }

  renderConfirmCatalyst() {
    const { url, owner } = this.getCatalyst()
    if (url === undefined || owner === undefined) {
      return this.renderEmpty()
    }

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
      <Button primary loading={this.props.isCreating} onClick={this.handleConfirmCatalyst}>{t('proposal_modal.confirm')}</Button>
    </Modal.Content>
  }

  handleConfirmPoi = () => {
    const { x, y } = this.getPosition()
    if (isValidPosition(x) && isValidPosition(y)) {
      this.props.onCreatePoi(x!, y!)
    }
  }

  renderConfirmPoi() {
    const { x, y } = this.getPosition()
    if (x === undefined || y === undefined) {
      return this.renderEmpty()
    }
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
      <Button primary loading={this.props.isCreating} onClick={this.handleConfirmPoi}>{t('proposal_modal.confirm')}</Button>
    </Modal.Content>
  }

  handleConfirmBan = () => {
    const name = this.getBan()
    if (isValidName(name)) {
      this.props.onCreateBan(name!)
    }
  }

  renderConfirmBan() {
    const name = this.getBan()
    if (name === undefined) {
      return this.renderEmpty()
    }

    return <Modal.Content className="NewProposalModalStep">
      <Modal.Header>
        <Header>{t('proposal_modal.title_ban')}</Header>
      </Modal.Header>
      <Modal.Description>
        {t('proposal_modal.confirm_ban', { name: <b>{name}</b> })}
      </Modal.Description>
      <Button primary loading={this.props.isCreating} onClick={this.handleConfirmBan}>{t('proposal_modal.confirm')}</Button>
    </Modal.Content>
  }

  renderConfirmed() {
    return <Modal.Content className="NewProposalModalStep">
      <Modal.Header>
        <Header>{t('proposal_modal.confirmed_title')}</Header>
      </Modal.Header>
      <Modal.Description>{t('proposal_modal.confirmed')}</Modal.Description>
      <Button onClick={this.handleClose}>{t('general.close')}</Button>
    </Modal.Content>
  }

  renderLoading() {
    return <Modal.Content className="NewProposalModalStep">
      <Loader active />
    </Modal.Content>
  }

  renderConnect() {
    const { isConnecting, isEnabling } = this.props
    return <Modal.Content className="NewProposalModalStep Connect">
        <img src={signIn} alt="sign-in" />
        <p>{t("general.sign_in_detail")}</p>
        <Button primary size="small" loading={isConnecting || isEnabling} onClick={this.props.onConnect}>
          {t("general.sign_in")}
        </Button>
    </Modal.Content>
  }

  renderNoPower() {
    return <Modal.Content className="NewProposalModalStep">
      <Modal.Header>
        <Header>{t('proposal_modal.title_wrap')}</Header>
      </Modal.Header>
      <Modal.Description>{t('proposal_modal.description_wrap')}</Modal.Description>
      <Button primary onClick={this.handleWrap}>{t('proposal_modal.confirm_wrap')}</Button>
    </Modal.Content>
  }

  renderEmpty() {
    return <Modal.Content className="NewProposalModalStep"></Modal.Content>
  }

  render() {
    const step = this.getStep()
    const { isConnecting, wallet, isConnected } = this.props
    return <Modal className="NewProposalModal" open={step > 0} onClose={this.handleClose}>
      <Icon name="close" onClick={this.handleClose} />
      {step > 1 && <Icon name="chevron left" onClick={this.handleBack} />}
      <div className="NewProposalModalStepsContainer">
        <div
          className="NewProposalModalSteps"
          style={{ transform: `translateX(${(step - 1) * -100}%)` }}
        >
          {isConnecting && this.renderLoading()}
          {!isConnecting && !isConnected && this.renderConnect()}
          {!isConnecting && isConnected && !wallet?.votingPower && this.renderNoPower()}
          {this.renderOptions()}
          {this.renderForm()}
          {this.renderConfirm()}
          {this.renderConfirmed()}
        </div>
      </div>
    </Modal>
  }
}
