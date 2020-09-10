import React from 'react'
import { Props } from './ProposalTitle.props'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { getAppName } from 'modules/app/utils'
import { env } from 'decentraland-commons'

const DECENTRALAND_URL = env.get('REACT_APP_DECENTRALAND_URL', '')

export default class ProposalTitle extends React.PureComponent<Props> {
  render() {

    const { vote, description } = this.props
    if (vote) {
      if (vote.metadata) {
        return <Header><pre>{vote.metadata}</pre></Header>
      }

      if (description) {

        if (description.firstDescriptionAnnotated) {
          return <React.Fragment>{description.firstDescriptionAnnotated.map((annotations, i) => {
            return <Header key={i}>{annotations.map((annotation, j) => {
              switch (annotation.type) {
                case 'dcl:name':
                  return <b className="primary">"{annotation.value}"</b>

                case 'dcl:domain':
                  return <a target="_blank" rel="noopener noreferrer" href={`https://${annotation.value}`}>"{annotation.value}"</a>

                case 'dcl:position':
                  return <a target="_blank" rel="noopener noreferrer" href={`${DECENTRALAND_URL}/?position=${annotation.value.position}`}><b>"{annotation.value.position}"</b></a>

                case 'address':
                  return <span title={annotation.value}><Blockie key={j} seed={annotation.value}>
                    <Address value={annotation.value} strong />
                  </Blockie></span>

                case 'app': {
                  return <b className="primary" title={annotation.value.address}>
                    {getAppName(annotation.value.address) || annotation.value.name}
                  </b>
                }

                case 'role':
                  return <b className="primary">{` ${annotation.value.id} `}</b>

                case 'apmPackage':
                  return ' ' + annotation.value.name + ' '

                case 'kernelNamespace':
                  return ' ' + annotation.value.name + ' '

                case 'bytes32':
                  return ' ' + annotation.value + ' '

                case 'text':
                  return ' ' + annotation.value + ' '

                default:
                  return 'MISSING'
              }
            })}</Header>
          })}</React.Fragment>
        }

        if (description.description) {
          return <Header>{description.description}</Header>
        }

        return <Header sub>No description</Header>
      }
    }

    return <Loader active inline size="small" />
  }
}
