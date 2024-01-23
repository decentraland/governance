import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { ethers } from 'ethers'
import { Request } from 'express'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { SNAPSHOT_SPACE } from '../../entities/Snapshot/constants'
import { EventsService } from '../services/events'
import { validateAlchemyWebhookSignature } from '../utils/validations'

export default routes((route) => {
  route.post('/webhooks/delegation-update', handleAPI(delegationUpdate))
})

async function delegationUpdate(req: Request) {
  validateAlchemyWebhookSignature(req)

  const block = req.body.event.data.block as Block
  if (block.logs.length === 0) {
    return
  }

  if (block.logs.length > 0) {
    for (const log of block.logs) {
      const spaceId = ethers.utils.parseBytes32String(log.topics[2])
      if (spaceId !== SNAPSHOT_SPACE) {
        continue
      }
      const delegator = decodeTopicToAddress(log.topics[1])
      const delegate = decodeTopicToAddress(log.topics[3])

      //TODO: save timestamp as creation date & save tx id to check for duplicates before creating event
      if (log.topics[0] === SET_DELEGATE_SIGNATURE_HASH) {
        await EventsService.delegationSet(delegate, delegator)
      }
      if (log.topics[0] === CLEAR_DELEGATE_SIGNATURE_HASH) {
        await EventsService.delegationClear(delegate, delegator)
      }
    }
  }

  return 'hello alchemy'
}

const CLEAR_DELEGATE_SIGNATURE_HASH = '0x9c4f00c4291262731946e308dc2979a56bd22cce8f95906b975065e96cd5a064'
const SET_DELEGATE_SIGNATURE_HASH = '0xa9a7fd460f56bddb880a465a9c3e9730389c70bc53108148f16d55a87a6c468e'

function decodeTopicToAddress(topic: string) {
  const address = '0x' + topic.slice(topic.length - 40)
  if (!isEthereumAddress(address)) {
    throw new Error('Decoded string is not a valid address')
  }
  return address
}

type Block = {
  hash: string
  number: number
  timestamp: number
  logs: Log[]
}

type Log = {
  index: number
  topics: string[]
  data: string
  transaction: Transaction
}

type Transaction = {
  hash: string
  nonce: number
  index: number
  from: {
    address: string
  }
}
