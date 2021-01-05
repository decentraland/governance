import React from 'react'
import { Props } from './ProposalEmbed.types'
import { EmbedType } from 'modules/embed/types'
import './ProposalEmbed.css'


export default class ProposalEmbed extends React.PureComponent<Props, any> {

  render() {
    const { embed } = this.props

    switch (embed.type) {
      case EmbedType.Topic:
        return <div className="ProposalEmbed" dangerouslySetInnerHTML={{ __html: embed.content.cooked }} />

      case EmbedType.LoomVideo:
        return <div className="ProposalEmbed" dangerouslySetInnerHTML={{ __html: embed.content }} />

      default:
        return null
    }
  }
}
