import React from 'react'
import { Props } from './ProposalEmbed.types'
import { EmbedType } from 'modules/embed/types'
import './ProposalEmbed.css'
import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'


export default class ProposalEmbed extends React.PureComponent<Props, any> {

  render() {
    const { embed } = this.props
    const url = new URL(embed.url)

    switch (embed.type) {
      case EmbedType.Topic:
        return <div className="ProposalEmbed">
          <div dangerouslySetInnerHTML={{ __html: embed.content.cooked }} />
          <div  className="ProposalEmbedActions">
            <Button basic as="a" target="_blank" href={embed.url} rel="noopener noreferrer" >
              {t('proposal_detail_page.open_at', { target: url.host })}
            </Button>
          </div>
        </div>

      case EmbedType.LoomVideo:
        return <div className="ProposalEmbed" dangerouslySetInnerHTML={{ __html: embed.content }} />

      default:
        return null
    }
  }
}
