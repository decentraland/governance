import crypto from 'crypto'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import { Request } from 'express'
import isArray from 'lodash/isArray'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import isUUID from 'validator/lib/isUUID'

import { SnapshotProposal } from '../clients/SnapshotTypes'
import { ALCHEMY_DELEGATIONS_WEBHOOK_SECRET, DISCOURSE_WEBHOOK_SECRET } from '../constants'
import isDAOCommittee from '../entities/Committee/isDAOCommittee'
import isDebugAddress from '../entities/Debug/isDebugAddress'
import { ProjectStatus } from '../entities/Grant/types'
import { ProposalAttributes, ProposalStatus, ProposalStatusUpdate } from '../entities/Proposal/types'
import { isProjectProposal, isValidProposalStatusUpdate } from '../entities/Proposal/utils'
import { validateUniqueAddresses } from '../entities/Transparency/utils'
import { ErrorService } from '../services/ErrorService'
import { ProjectService } from '../services/ProjectService'
import { EventFilterSchema } from '../shared/types/events'
import logger from '../utils/logger'

import { ErrorCategory } from './errorCategories'

export function validateDates(start?: string, end?: string) {
  const validatedStart = new Date(validateDate(start)!)
  const validatedEnd = new Date(validateDate(end)!)
  return { validatedStart, validatedEnd }
}

export function validateDate(date?: string, required?: 'optional') {
  if ((required !== 'optional' && !(date && isValidDate(date))) || (date && !isValidDate(date))) {
    throw new RequestError('Invalid date', RequestError.BadRequest)
  }
  return date
}

export function isValidDate(date?: string) {
  if (!date || date.length === 0) return false
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime())
}

export function validateProposalFields(fields: unknown) {
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

export function validateId(id?: string | null) {
  if (!(id && isUUID(id))) {
    throw new RequestError('Invalid id', RequestError.BadRequest)
  }
  return id
}

export function validateAddress(address?: string) {
  if (!address || !isEthereumAddress(address)) {
    throw new RequestError(`Invalid address ${address}`, RequestError.BadRequest)
  }
  return address
}

export function validateAddresses(addresses?: string[]) {
  if (!Array.isArray(addresses)) {
    throw new RequestError(`Invalid addresses ${addresses}`, RequestError.BadRequest)
  }
  addresses.forEach((address) => {
    validateAddress(address)
  })
}

export const areValidAddresses = (addresses: string[]) =>
  Array.isArray(addresses) && addresses.every((item) => isEthereumAddress(item))

export function validateProposalSnapshotId(proposalSnapshotId?: string) {
  if (!proposalSnapshotId || proposalSnapshotId.length === 0) {
    throw new RequestError('Invalid snapshot id')
  }
  return proposalSnapshotId
}

export function validateRequiredString(fieldName: string, value?: string) {
  if (!value || value.length === 0) {
    throw new RequestError(`Invalid ${fieldName}`, RequestError.BadRequest)
  }
  return value
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateRequiredStrings(fieldNames: string[], requestBody: Record<string, any>) {
  for (const fieldName of fieldNames) {
    const fieldValue = requestBody[fieldName]
    validateRequiredString(fieldName, fieldValue)
  }
}

export function validateDebugAddress(user: string | undefined) {
  if (!isDebugAddress(user)) {
    throw new RequestError('Invalid user', RequestError.Unauthorized)
  }
}

export function validateDiscourseWebhookSignature(req: Request) {
  const providedSignature = req.get('X-Discourse-Event-Signature') || ''
  if (!DISCOURSE_WEBHOOK_SECRET || DISCOURSE_WEBHOOK_SECRET.length === 0) {
    throw new RequestError('Endpoint disabled', RequestError.NotImplemented)
  }
  const payload = req.body
  const calculatedSignature = 'sha256='.concat(
    crypto.createHmac('sha256', DISCOURSE_WEBHOOK_SECRET).update(JSON.stringify(payload)).digest('hex')
  )

  if (providedSignature !== calculatedSignature) {
    ErrorService.report('Invalid discourse webhook signature', { category: ErrorCategory.Discourse })
    throw new RequestError('Invalid signature', RequestError.Forbidden)
  }
}

export function validateAlchemyWebhookSignature(req: Request) {
  const signature = req.get('x-alchemy-signature')
  if (!ALCHEMY_DELEGATIONS_WEBHOOK_SECRET || ALCHEMY_DELEGATIONS_WEBHOOK_SECRET.length === 0) {
    throw new RequestError('Endpoint disabled', RequestError.NotImplemented)
  }
  const body = JSON.stringify(req.body)
  const hmac = crypto.createHmac('sha256', ALCHEMY_DELEGATIONS_WEBHOOK_SECRET)
  hmac.update(body, 'utf8')
  const digest = hmac.digest('hex')
  if (signature !== digest) {
    ErrorService.report('Invalid alchemy webhook signature', { category: ErrorCategory.Webhook })
    throw new RequestError('Invalid signature', RequestError.Forbidden)
  }
}

export function validateEventFilters(req: Request) {
  const { event_type, proposal_id, with_interval } = req.query
  const filters: Record<string, unknown> = {}
  if (event_type) {
    filters.event_type = isArray(event_type) ? event_type : [event_type]
  }
  if (proposal_id) {
    filters.proposal_id = proposal_id.toString()
  }
  filters.with_interval = with_interval ? stringToBoolean(with_interval.toString()) : undefined
  const parsedEventTypes = EventFilterSchema.safeParse(filters)
  if (!parsedEventTypes.success) {
    throw new Error('Invalid event types: ' + parsedEventTypes.error.message)
  }

  return parsedEventTypes.data
}

export function validateIsDaoCommittee(user: string) {
  if (!isDAOCommittee(user)) {
    throw new RequestError('Only DAO committee members can update a proposal status', RequestError.Forbidden)
  }
}

export function validateStatusUpdate(proposal: ProposalAttributes, statusUpdate: ProposalStatusUpdate) {
  const { status: newStatus, vesting_addresses } = statusUpdate
  if (!isValidProposalStatusUpdate(proposal.status, newStatus)) {
    throw new RequestError(`${proposal.status} can't be updated to ${newStatus}`, RequestError.BadRequest, statusUpdate)
  }
  if (newStatus === ProposalStatus.Enacted && isProjectProposal(proposal.type)) {
    if (!vesting_addresses || vesting_addresses.length === 0) {
      throw new RequestError('Vesting addresses are required for grant or bid proposals', RequestError.BadRequest)
    }
    if (vesting_addresses.some((address) => !isEthereumAddress(address))) {
      throw new RequestError('Some vesting address is invalid', RequestError.BadRequest)
    }
    if (!validateUniqueAddresses(vesting_addresses)) {
      throw new RequestError('Vesting addresses must be unique', RequestError.BadRequest)
    }
  }
}

export async function validateIsAuthorOrCoauthor(user: string, projectId: string) {
  validateId(projectId)
  validateAddress(user)
  const isAuthorOrCoauthor = await ProjectService.isAuthorOrCoauthor(user, projectId)
  if (!isAuthorOrCoauthor) {
    throw new RequestError("User is not the project's author or coauthor", RequestError.Unauthorized)
  }
}

const NOT_EDITABLE_STATUS = new Set([ProjectStatus.Finished, ProjectStatus.Revoked])
export async function validateCanEditProject(user: string, projectId: string) {
  await validateIsAuthorOrCoauthor(user, projectId)
  const project = await ProjectService.getUpdatedProject(projectId)
  if (NOT_EDITABLE_STATUS.has(project.status)) {
    throw new RequestError('Project cannot be edited after it is finished or revoked', RequestError.BadRequest)
  }
}

export function validateBlockNumber(blockNumber?: unknown | null) {
  if (blockNumber !== null && blockNumber !== undefined && typeof blockNumber !== 'number') {
    throw new Error('Invalid blockNumber: must be null, undefined, or a number')
  }
}

export function stringToBoolean(str: string) {
  switch (str.toLowerCase().trim()) {
    case 'true':
    case '1':
    case 'yes':
      return true
    case 'false':
    case '0':
    case 'no':
      return false
    default:
      throw new Error('Invalid boolean value')
  }
}

const TRUSTED_IMAGE_DOMAINS = new Set([
  // Decentraland domains
  'decentraland.org',
  'cdn.decentraland.org',
  'peer.decentraland.org',
  'market.decentraland.org',
  'governance.decentraland.org',
  'events.decentraland.org',

  // Popular image hosting and CDNs
  'ipfs.io', // IPFS gateway
  'githubusercontent.com', // GitHub's image hosting
  'imgur.com', // Imgur
  'i.imgur.com',
  'cloudinary.com', // Cloudinary CDN
  'res.cloudinary.com',
  'images.unsplash.com', // Unsplash
  'i.ibb.co', // ImgBB
  'postimg.cc', // PostImage
  'i.postimg.cc',
  's3.amazonaws.com', // AWS S3
  'storage.googleapis.com', // Google Cloud Storage
  'drive.google.com', // Google Drive
  'dropboxusercontent.com', // Dropbox
  'www.dropbox.com',
  'media.discordapp.net', // Discord
  'cdn.discordapp.com',
  'discord.com',
  'discord.gg',
])

function isFromTrustedDomain(url: string): boolean {
  try {
    const urlObject = new URL(url)
    const hostname = urlObject.hostname
    return TRUSTED_IMAGE_DOMAINS.has(hostname)
  } catch {
    return false
  }
}

export async function isValidImage(imageUrl: string) {
  const allowedImageTypes = new Set(['image/bmp', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'])

  if (!isFromTrustedDomain(imageUrl)) {
    logger.error('Image not from trusted domain', { imageUrl })
    return false
  }

  return new Promise<boolean>((resolve) => {
    fetch(imageUrl)
      .then((response) => {
        const mime = response.headers.get('content-type')
        resolve(!!mime && allowedImageTypes.has(mime))
      })
      .catch((error) => {
        logger.error('Fetching image error', error)
        resolve(false)
      })
  })
}

export function extractImageUrls(markdown: string): string[] {
  const imageRegex = /!\[.*?\]\((.*?)\)|\[.*?\]:\s*(.*?)(?:\s|$)/g
  const urls: string[] = []
  let match

  while ((match = imageRegex.exec(markdown)) !== null) {
    const url = match[1] || match[2]
    if (url) urls.push(url)
  }

  return urls
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function validateImagesOnValue(value: any, errors: string[]) {
  if (typeof value === 'string') {
    const imageUrls = extractImageUrls(value)
    for (const imageUrl of imageUrls) {
      const isValid = await isValidImage(imageUrl)
      if (!isValid) {
        errors.push(imageUrl)
      }
    }
  } else if (value && typeof value === 'object') {
    await validateImagesOnObject(value, errors)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function validateImagesOnObject(obj: any, errors: string[]) {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      await validateImagesOnValue(item, errors)
    }
  } else {
    for (const key in obj) {
      await validateImagesOnValue(obj[key], errors)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function validateObjectMarkdownImages(obj: any): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = []

  await validateImagesOnObject(obj, errors)

  return {
    isValid: errors.length === 0,
    errors,
  }
}
