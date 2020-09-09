import React from 'react'
import { Props } from './ProposalTitle.props'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

export default class ProposalTitle extends React.PureComponent<Props> {
  render() {

    const { vote, description } = this.props
    if (vote) {
      if (vote.metadata) {
        return <Header>{vote.metadata}</Header>
      }

      if (description) {
        if (description.description) {
          return <Header>{description.description}</Header>
        }

        return <Header sub>No description</Header>
      }
    }

    return <Loader active inline size="small" />
  }
}
