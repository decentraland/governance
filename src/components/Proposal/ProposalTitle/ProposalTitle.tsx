import React from 'react'
import { Helmet } from 'react-helmet'
import Linkify from 'react-linkify';
import { Props } from './ProposalTitle.types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { getAppName } from 'modules/app/utils'
import { env } from 'decentraland-commons'
import { getAddressName } from 'modules/common/utils'
import { EtherScan, Network } from 'modules/wallet/types'
import { AggregatedVote } from 'modules/proposal/types'
import { Annotation } from 'modules/description/types'

const DECENTRALAND_URL = env.get('REACT_APP_DECENTRALAND_URL', '')
const METADATA_MAX_LENGTH = 168

export default class ProposalTitle extends React.PureComponent<Props> {

  static String(annotation: Annotation): string {
    switch (annotation.type) {
      case 'dcl:name':
      case 'dcl:domain':
      case 'dcl:position':
        return `"${annotation.value}"`

      case 'address':
        return getAddressName(annotation.value) || annotation.value

      case 'app':
        return getAppName(annotation.value.address) || annotation.value.name

      case 'role':
        return ` ${annotation.value.id} `

      case 'bytes32':
        return ` ${annotation.value.slice(0,6)}...${annotation.value.slice(-4)} `

      case 'apmPackage':
      case 'kernelNamespace':
        return ` ${annotation.value.name} `

      case 'text':
        return ` ${annotation.value} `

      default:
        return ' MISSING '
    }
  }

  static Annotation({ annotation, network }: { annotation: Annotation, network?: Network }) {
    switch (annotation.type) {
      case 'dcl:name': {
        return <b>"{annotation.value}"</b>
      }

      case 'dcl:domain': {
        let href = annotation.value + '/comms/status'
        if (!href.startsWith('https://')) {
          href = 'https://' + href
        }

        return <a target="_blank" rel="noopener noreferrer" href={href}>"{annotation.value}"</a>
      }

      case 'dcl:position': {
        return <a target="_blank" rel="noopener noreferrer" href={`${DECENTRALAND_URL}/?position=${annotation.value.position}`}><b>"{annotation.value.position}"</b></a>
      }

      case 'address': {
        const name = getAddressName(annotation.value)
        if (name) {
          const href = `${EtherScan[network || Network.MAINNET]}/address/${annotation.value}`
          return <a title={annotation.value} target="_blank" rel="noopener noreferrer" href={href}>
            {name && <b>{name}</b>}
          </a>
        }

        return <Blockie seed={annotation.value}>
          <Address value={annotation.value} strong />
        </Blockie>
      }

      case 'app': {
        return <b title={annotation.value.address}>
          {getAppName(annotation.value.address) || annotation.value.name}
        </b>
      }

      case 'role':
        return <b>{` ${annotation.value.id} `}</b>

      case 'bytes32':
        return <i title={annotation.value}>
          {` ${annotation.value.slice(0,6)}...${annotation.value.slice(-4)} `}
        </i>

      case 'apmPackage':
      case 'kernelNamespace':
        return <React.Fragment>{` ${annotation.value.name} `}</React.Fragment>

      case 'text':
        return <React.Fragment>{` ${annotation.value} `}</React.Fragment>

      default:
        return <React.Fragment>{' MISSING '}</React.Fragment>
    }
  }

  static LinkifyDecorator(decoratedHref: string, decoratedText: string, key: number): React.ReactNode {
    return (
      <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer">
        {decoratedText}
      </a>
    );
  }

  render() {

    const { proposal, description, network, primary, short } = this.props

    if (proposal) {
      if ((proposal as AggregatedVote).metadata) {
        let metadata = (proposal as AggregatedVote).metadata.trim()
        const shorted = Boolean(short && metadata.length > METADATA_MAX_LENGTH)
        if (shorted) {
          metadata = metadata.slice(0, METADATA_MAX_LENGTH - 3) + '...'
        }

        return <>
          {primary && <Helmet title={t('seo.title_extended', { title: metadata })} />}
          <Header>
            <pre>
              {shorted && metadata}
              {!shorted && <Linkify componentDecorator={ProposalTitle.LinkifyDecorator} >{metadata}</Linkify>}
            </pre>
          </Header>
        </>
      }

      if (description) {
        if (description.firstDescriptionAnnotated) {
          const title = description.firstDescriptionAnnotated.map(annotations => {
            return annotations.map(annotation => ProposalTitle.String(annotation)).join(' ')
          }).join('\n')

          return <>
            {primary && <Helmet title={t('seo.title_extended', { title })} />}
            {description.firstDescriptionAnnotated.map((annotations, i) => {
              return <Header key={`${proposal.id}-annotations:${i}`}>{annotations.map((annotation, j) => {
                const key = `${proposal.id}-annotations:${i}-item:${j}`
                return <ProposalTitle.Annotation key={key} annotation={annotation} network={network}/>
              })}</Header>
            })}
          </>
        }

        if (description.description) {
          return <>
            {primary && <Helmet title={t('seo.title_extended', { title: description.description })} />}
            <Header>{description.description}</Header>
          </>
        }

        return <>
          {primary && <Helmet title={t('seo.title')} />}
          <Header sub>No description</Header>
        </>
      }
    }

    return <>
      {primary && <Helmet title={t('seo.title')} />}
      <Loader active inline size="small" />
    </>
  }
}
