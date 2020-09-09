import React from 'react'
import { Props, State } from './QuestionForm.types'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

export default class QuestionForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = { value: props.defaultValue || '' }
  }

  isValid() {
    return !!this.state.value
  }

  handleChangeUrl = (_: React.FormEvent<any>, props: Record<string, string>) => {
    this.setState({ value: props.value })
  }

  handleConfirm = (event: React.MouseEvent<any>) => {
    if (this.props.onConfirm && this.isValid()) {
      this.props.onConfirm(event, this.state.value || '')
    }
  }

  render() {
    return <Modal.Content className="NewProposalModalStep">
      <Modal.Header>
        <Header>{t('proposal_modal.title_question')}</Header>
      </Modal.Header>
      <Modal.Description>
        {t('proposal_modal.description_question')}
      </Modal.Description>
      <Grid>
        <Grid.Row>
          <Grid.Column mobile="2" />
          <Grid.Column mobile="12">
            <Field type="text" label={t('proposal_modal.title_question')} value={this.state.value} onChange={this.handleChangeUrl} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Button primary onClick={this.handleConfirm} disabled={!this.isValid()}>{t('proposal_modal.confirm')}</Button>
    </Modal.Content>
  }
}
