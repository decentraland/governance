import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import isUUID from 'validator/lib/isUUID'

import { SnapshotProposal } from '../../clients/SnapshotGraphqlTypes'

export function validateDates(start?: string, end?: string) {
  validateDate(start)
  validateDate(end)
}

export function validateDate(date?: string, required?: 'optional') {
  if ((required !== 'optional' && !(date && isValidDate(date))) || (date && !isValidDate(date))) {
    throw new RequestError('Invalid date', RequestError.BadRequest)
  }
}

function isValidDate(date: string) {
  if (date.length === 0) return false
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime())
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

export function validateProposalSnapshotId(proposalSnapshotId?: string) {
  if (!proposalSnapshotId || proposalSnapshotId.length === 0) {
    throw new RequestError('Invalid snapshot id')
  }
}

export function validateStringNotEmpty(fieldName: string, someString?: string) {
  if (!someString || someString.length === 0) {
    throw new RequestError(`Invalid ${fieldName}`, RequestError.BadRequest)
  }
}
