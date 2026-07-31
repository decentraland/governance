import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { AccountType, UserProfile } from '../entities/User/types'
import { validateAccountTypes } from '../entities/User/utils'
import { UserService } from '../services/user'
import { validateAddress } from '../utils/validations'

// Push is a subscription held elsewhere, so it is neither linked by signature nor unlinked here.
const LINKABLE_ACCOUNTS = new Set([AccountType.Forum, AccountType.Discord])

export default routes((route) => {
  const withAuth = auth()
  route.get('/user/validate', withAuth, handleAPI(getValidationMessage))
  route.post('/user/validate/forum', withAuth, handleAPI(validateForumUser))
  route.post('/user/validate/discord', withAuth, handleAPI(validateDiscordUser))
  route.post('/user/discord-active', withAuth, handleAPI(updateDiscordStatus))
  route.get('/user/discord-active', withAuth, handleAPI(getIsDiscordActive))
  route.get('/user/discord-linked', withAuth, handleAPI(isDiscordLinked))
  route.get('/user/:address/is-validated', handleAPI(isValidated))
  route.get('/user/:address', handleAPI(getProfile))
  route.post('/user/unlink', withAuth, handleAPI(unlinkAccount))
})

async function getValidationMessage(req: WithAuth) {
  const address = req.auth!
  // The account type is part of the message that gets signed, so a message issued without one can
  // never validate against either flow. Refuse instead of handing back an unusable message.
  if (Array.isArray(req.query.account)) {
    throw new RequestError('Only one account can be validated at a time', RequestError.BadRequest)
  }
  const accounts = validateAccountTypes(req.query.account)
  if (!LINKABLE_ACCOUNTS.has(accounts[0])) {
    throw new RequestError(`Account type ${accounts[0]} cannot be validated this way`, RequestError.BadRequest)
  }

  return UserService.getValidationMessage(address, accounts[0])
}

async function validateForumUser(req: WithAuth) {
  const user = req.auth!
  return UserService.validateForumUser(user)
}

async function validateDiscordUser(req: WithAuth) {
  const user = req.auth!
  return await UserService.validateDiscordUser(user)
}

async function updateDiscordStatus(req: WithAuth) {
  const address = req.auth!
  const { is_discord_notifications_active } = req.body
  if (typeof is_discord_notifications_active !== 'boolean') {
    throw new RequestError('Invalid discord status', RequestError.BadRequest)
  }
  await UserService.updateDiscordStatus(address, is_discord_notifications_active)
}

async function getIsDiscordActive(req: WithAuth) {
  const address = req.auth!
  return await UserService.getIsDiscordActive(address)
}

async function isDiscordLinked(req: WithAuth) {
  const address = req.auth!
  return await UserService.isDiscordLinked(address)
}

async function isValidated(req: Request) {
  const address = validateAddress(req.params.address)
  const accounts = validateAccountTypes(req.query.account as string | string[] | undefined)
  return await UserService.isValidated(address, new Set(accounts))
}

async function getProfile(req: Request): Promise<UserProfile> {
  const address = validateAddress(req.params.address)
  return await UserService.getProfile(address)
}

async function unlinkAccount(req: WithAuth) {
  const address = req.auth!
  const { accountType } = req.body
  // Exactly one account is unlinked per call. Checked before parsing, because parsing drops entries
  // it does not recognise — so ['forum', 'nonsense'] would otherwise look like a single valid
  // account and unlink it while silently ignoring the rest of what was asked for.
  if (Array.isArray(accountType)) {
    throw new RequestError('Only one account can be unlinked at a time', RequestError.BadRequest)
  }
  const accounts = validateAccountTypes(accountType)
  // Not every account type can be unlinked: the query behind this only clears the forum and discord
  // columns, and push is a subscription held elsewhere. Refuse here rather than let it reach a
  // switch that has no case for it.
  if (!LINKABLE_ACCOUNTS.has(accounts[0])) {
    throw new RequestError(`Account type ${accounts[0]} cannot be unlinked`, RequestError.BadRequest)
  }
  return await UserService.unlinkAccount(address, accounts[0])
}
