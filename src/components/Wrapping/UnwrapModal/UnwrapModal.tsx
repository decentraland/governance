import React from 'react'
import { Props, State } from './UnwrapModal.types'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import { locations } from 'routing/locations'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import './UnwrapModal.css'

export default class UnwrapModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      value: Number(this.props?.params?.amount) || 0
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.params.amount !== prevProps.params.amount) {
      this.setState({ value: Number(this.props.params.amount) || 0 })
    }
  }

  handleChangeWrapValue = (event: React.FormEvent<HTMLInputElement>) => {
    const raw = String(event.currentTarget.value || '')
    if (raw === '') {
      return this.setState({ value: '' })
    }

    const value = Number(raw.replace(/\D/gi, ''))
    if (Number.isNaN(value)) {
      return this.setState({ value: '' })
    }

    this.setState({ value })
  }

  handleWrapMana = () => {
    if (
      this.state.value &&
      this.state.value > 0 &&
      this.props.onUnwrapToken
    ) {
      this.props.onUnwrapToken(this.state.value)
    }
  }

  handleClose = () => {
    this.props.onNavigate(locations.wrapping({}))
  }

  isOpen() {
    return this.props.params.modal === 'unwrap'
  }

  render() {
    const { completed } = this.props.params
    const wallet = this.props.wallet
    return <Modal className="UnwrapModal" open={this.isOpen()} onClose={this.handleClose}>
      <Icon name="close" onClick={this.handleClose} />
      <Modal.Content>
        <Modal.Header><Header>{t('unwrapping_modal.title')}</Header></Modal.Header>
        {!completed && <Modal.Description>{t('unwrapping_modal.description')}</Modal.Description>}
        {!completed && <Modal.Description>
          <Field
            type="number" min={0} message={wallet?.manaMiniMe ? t('unwrapping_modal.input_hint', { value: wallet?.manaMiniMe || 0 }) : ''} onChange={this.handleChangeWrapValue} value={this.state.value} />
        </Modal.Description>}
        {!completed && <Modal.Actions>
          <Button
            primary
            disabled={this.props.isConnecting || this.props.isUnwrappingMana || !this.state?.value}
            loading={this.props.isConnecting || this.props.isUnwrappingMana}
            onClick={this.handleWrapMana}
          >{t('unwrapping_modal.action')}</Button>
        </Modal.Actions>}
        {completed && <Modal.Description>{t('unwrapping_modal.completed')}</Modal.Description>}
        {completed && <Modal.Actions>
          <Button onClick={this.handleClose}>{t('general.close')}</Button>
        </Modal.Actions>}
      </Modal.Content>
    </Modal>
  }
}
