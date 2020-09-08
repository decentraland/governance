import React from 'react'
import { Props, State } from './PoiForm.types'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { isValidPosition } from '../utils'

export default class PoiForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      x: props.defaultValue?.x || 0,
      y: props.defaultValue?.y || 0
    }
  }

  isValid() {
    return isValidPosition(this.state.x) && isValidPosition(this.state.y)
  }

  handleChangeX = (_: React.FormEvent<any>, props: Record<string, string>) => {
    this.setState({
      x: props.value,
      y: this.state.y
    })
  }

  handleChangeY = (_: React.FormEvent<any>, props: Record<string, string>) => {
    this.setState({
      x: this.state.x,
      y: props.value
    })
  }

  handleConfirm = (event: React.MouseEvent<any>) => {
    if (this.props.onConfirm && this.isValid()) {
      this.props.onConfirm(event, {
        x: Number(this.state.x),
        y: Number(this.state.y)
      })
    }
  }

  render() {
    return <Modal.Content className="NewProposalModalStep PoiForm">
      <Modal.Header>
        <Header>{t('proposal_modal.title_poi')}</Header>
      </Modal.Header>
      <Modal.Description>
        {t('proposal_modal.description_poi')}
      </Modal.Description>
      <Grid>
        <Grid.Row>
          <Grid.Column mobile="2" />
          <Grid.Column mobile="6">
            <Field type="number" placeholder="X" value={this.state.x} onChange={this.handleChangeX} />
          </Grid.Column>
          <Grid.Column mobile="6">
            <Field type="number" placeholder="Y" value={this.state.y} onChange={this.handleChangeY} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Button primary onClick={this.handleConfirm} disabled={this.isValid()}>{t('proposal_modal.confirm')}</Button>
    </Modal.Content>
  }
}
