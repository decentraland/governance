import React from 'react'
import { Props, State } from './CatalystForm.types'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import isFQDN from 'validator/lib/isFQDN'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

export default class CatalystForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      url: props.defaultValue?.url || '',
      owner: props.defaultValue?.owner || ''
    }
  }

  isValid() {
    return isFQDN(this.state.url || '') && isEthereumAddress(this.state.owner || '')
  }

  handleChangeUrl = (_: React.FormEvent<any>, props: Record<string, string>) => {
    this.setState({
      url: props.value,
      owner: this.state.owner
    })
  }

  handleChangeOwner = (_: React.FormEvent<any>, props: Record<string, string>) => {
    this.setState({
      url: this.state.url,
      owner: props.value
    })
  }

  handleConfirm = (event: React.MouseEvent<any>) => {
    if (this.props.onConfirm && this.isValid()) {
      this.props.onConfirm(event, {
        url: this.state.url || '',
        owner: this.state.owner || ''
      })
    }
  }

  render() {
    return <Modal.Content className="NewProposalModalStep">
      <Modal.Header>
        <Header>{t('proposal_modal.title_catalyst')}</Header>
      </Modal.Header>
      <Modal.Description>
        {t('proposal_modal.description_catalyst')}
      </Modal.Description>
      <Grid>
        <Grid.Row>
          <Grid.Column mobile="2" />
          <Grid.Column mobile="12">
            <Field placeholder="Owner (Address)" value={this.state.owner} onChange={this.handleChangeOwner} type="address" />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column mobile="2" />
          <Grid.Column mobile="12">
            <Field placeholder="URL" message="eg: decentraland.org" value={this.state.url} onChange={this.handleChangeUrl} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Button primary onClick={this.handleConfirm} disabled={!this.isValid()}>{t('proposal_modal.confirm')}</Button>
    </Modal.Content>
  }
}
