import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import isUUID from 'validator/lib/isUUID'

import { SnapshotProposal } from '../../clients/SnapshotGraphqlTypes'

export function validateDates(start?: string, end?: string) {
  if (!start || !(start.length > 0) || !end || !(end.length > 0)) {
    throw new RequestError('Invalid dates', RequestError.BadRequest)
  }

  const startDate = new Date(start)
  const endDate = new Date(end)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new RequestError('Invalid date formats', RequestError.BadRequest)
  }
}

export function validateFields(fields: unknown) {
  if (!fields || !Array.isArray(fields) || fields.length === 0) {
    throw new RequestError('Invalid fields', RequestError.BadRequest)
  }
  const validFields: (keyof SnapshotProposal)[] = [
    'id',
    'ipfs',
    'author',
    'created',
    'type',
    'title',
    'body',
    'choices',
    'start',
    'end',
    'snapshot',
    'state',
    'link',
    'scores',
    'scores_by_strategy',
    'scores_state',
    'scores_total',
    'scores_updated',
    'votes',
    'space',
    'strategies',
    'discussion',
    'plugins',
  ]
  if (!fields.every((field) => validFields.includes(field))) {
    throw new RequestError('Invalid fields', RequestError.BadRequest)
  }
}

export function validateProposalId(id?: string, required?: 'optional') {
  if (required !== 'optional' && (!id || !isUUID(id))) {
    throw new RequestError('Invalid proposal id', RequestError.BadRequest)
  }
  if (id && !isUUID(id)) {
    throw new RequestError('Invalid proposal id', RequestError.BadRequest)
  }
}

export function validateAddress(address: string) {
  if (!address || !isEthereumAddress(address)) {
    throw new RequestError(`Invalid address ${address}`, RequestError.BadRequest)
  }
}

export function validateUniqueAddresses(addresses: string[]): boolean {
  const uniqueSet = new Set(addresses.map((address) => address.toLowerCase()))

  return uniqueSet.size === addresses.length
}
