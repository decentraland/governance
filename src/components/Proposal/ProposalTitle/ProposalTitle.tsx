import React from 'react'
import { Props } from './ProposalTitle.props'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'
import { Address } from 'decentraland-ui/dist/components/Address/Address'

export default class ProposalTitle extends React.PureComponent<Props> {
  render() {

    const { vote, description } = this.props
    if (vote) {
      if (vote.metadata) {
        return <Header>{vote.metadata}</Header>
      }

      if (description) {

        if (description.firstDescribedSteps) {
          return <Header>{description.firstDescribedSteps.map((describedStep, i) => {
            if (!describedStep.annotatedDescription) {
              return null
            }

            return <React.Fragment key={i}>
              {describedStep.annotatedDescription.map((annotatedDescription, i) => {
                if (!annotatedDescription) {
                  return null
                }

                const { type, value } = annotatedDescription
                switch (type) {
                  case 'address':
                    // {
                    //   "type": "address",
                    //   "value": "0x326923D43226d9824aab694A3C1C566FeDa50AEb"
                    // }
                    return <Blockie key={i} seed={value}>
                      <Address value={value} strong />
                    </Blockie>

                  case 'app':
                    // {
                    //   "type": "app",
                    //   "value": {
                    //     "address": "0x5616500b003475136ee6b0844896a2e1ccc68140",
                    //     "appId": "0x9fa3927f639745e587912d4b0fea7ef9013bf93fb907d29faeab57417ba6e1d4",
                    //     "codeAddress": "0xb4fa71b3352d48aa93d34d085f87bb4af0ce6ab5",
                    //     "contentUri": "ipfs:QmUvWBZqpKepDwS5WUsTTURwiBRvhoGRTjwJG7Em5TU2UJ",
                    //     "isForwarder": true,
                    //     "isUpgradeable": true,
                    //     "kernelAddress": "0x1dcd3b94027ec9125c475e9c2e09c7b6fafad631",
                    //     "name": "voting",
                    //     "organization": null,
                    //     "registryAddress": "0xda897630fa0f1902f99623bc00e18acd12657d4f",
                    //     "repoAddress": "0xa228444b1fe0810c47f6c6c980359e6799b39c7f",
                    //     "version": "2.1.7"
                    //   }
                    // }
                    return <Blockie key={i} seed={value.address}>
                      <Address value={value.address} strong />
                    </Blockie>

                  case 'role':
                    // {
                    //   "type": "role",
                    //   "value": {
                    //     "name": "Add Remove catalyst",
                    //     "id": "MODIFY_ROLE",
                    //     "params": [],
                    //     "bytes": "0x939988319f0e332cbcac12c2ceebb890513ee15a65c79b459c2c9de1d3b0405b"
                    //   }
                    // }
                    return ' ' + value.id + ' '

                  case 'apmPackage':
                    // {
                    //   "type": "apmPackage",
                    //   "value": {
                    //     "address": "0x80e55ee7f2e6b27ca2db9db0fe92642fc26212d1",
                    //     "appId": "0x1140ead91a63facf298a963dd4bb9904cec93057a7f66a8e6e9a3d4a7f1ce6d4",
                    //     "codeAddress": "0xebfca27852362676ac9f263571dada0e09c2aa6f",
                    //     "contentUri": "ipfs:QmS9pfTKTiRksZ6JtVbioVATiEXjjWrEiCX2QUDPBxELx5",
                    //     "isForwarder": false,
                    //     "isUpgradeable": true,
                    //     "kernelAddress": "0x1dcd3b94027ec9125c475e9c2e09c7b6fafad631",
                    //     "name": "dcl-list",
                    //     "organization": null,
                    //     "registryAddress": "0x915c4a47e7c7f7ab04ac70b4bcfba257a1e8b040",
                    //     "repoAddress": "0x03884591d53987899bbfea36baf030d5997e3dbf",
                    //     "version": "1.0.5"
                    //   }
                    // }
                    return ' ' + value.name  + ' '

                  case 'kernelNamespace':
                    // {
                    //   "type": "kernelNamespace",
                    //   "value": {
                    //     "name": "App code",
                    //     "hash": "0xf1f3eb40f5bc1ad1344716ced8b8a0431d840b5783aea1fd01786bc26f35ac0f"
                    //   }
                    // }
                    return ' ' + value.name + ' '

                  case 'bytes32':
                    // {
                    //   "type": "bytes32",
                    //   "value": "0x1b69bdf528f90f71a05f3b78c84c9f805c42064457a2d01c86201ba09971f85b"
                    // }
                    return ' ' + value + ' '

                  case 'text':
                    // {
                    //   "type": "text",
                    //   "value": "with owner"
                    // }
                    return ' ' + value + ' '

                  default:
                    return 'MISSING'
                }
              })}
            </React.Fragment>
          })}</Header>
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
