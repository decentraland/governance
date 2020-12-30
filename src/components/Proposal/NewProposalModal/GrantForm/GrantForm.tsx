import React from 'react'
import { Props, State } from './GrantForm.types'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import isFQDN from 'validator/lib/isFQDN'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

export default class GrantForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      url: props.defaultValue?.url || '',
      amount: props.defaultValue?.amount || '',
      destination: props.defaultValue?.destination || '',
    }
  }

  isValid() {
    return isFQDN(this.state.url || '') && isEthereumAddress(this.state.destination || '') && (this.state.amount || 0) > 0
  }

  handleChangeUrl = (_: React.FormEvent<any>, props: Record<string, string>) => {
    this.setState({
      url: props.value,
      amount: this.state.amount,
      destination: this.state.destination,
    })
  }

  handleChangeDestination = (_: React.FormEvent<any>, props: Record<string, string>) => {
    this.setState({
      url: this.state.url,
      amount: this.state.amount,
      destination: props.value
    })
  }

  handleChangeAmount = (_: React.FormEvent<any>, props: Record<string, number>) => {
    this.setState({
      url: this.state.url,
      amount: props.value,
      destination: this.state.destination,
    })
  }


  handleConfirm = (event: React.MouseEvent<any>) => {
    if (this.props.onConfirm && this.isValid()) {
      this.props.onConfirm(event, {
        url: this.state.url || '',
        destination: this.state.destination || '',
        amount: Number(this.state.amount) || 0,
      })
    }
  }

  render() {
    return <Modal.Content className="NewProposalModalStep">
      <Modal.Header>
        <Header>{t('proposal_modal.title_grant')}</Header>
      </Modal.Header>
      <Modal.Description>
        {t('proposal_modal.description_grant')}
      </Modal.Description>
      <Grid>
        <Grid.Row>
          <Grid.Column mobile="2" />
          <Grid.Column mobile="12">
            <Field placeholder="Destination (Address)" value={this.state.destination} onChange={this.handleChangeDestination} type="address" />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column mobile="2" />
          <Grid.Column mobile="12">
            <Field placeholder="Amount in MANA" value={this.state.amount} onChange={this.handleChangeAmount} type="number" />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column mobile="2" />
          <Grid.Column mobile="12">
            <Field placeholder="Proposal URL" message="eg: forum.decentraland.org" value={this.state.url} onChange={this.handleChangeUrl} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Button primary onClick={this.handleConfirm} disabled={!this.isValid()}>{t('proposal_modal.confirm')}</Button>
    </Modal.Content>
  }
}
