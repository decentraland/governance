import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { validateAccountTypes } from '../entities/User/utils'
import { UserService } from '../services/user'
import { validateAddress } from '../utils/validations'

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
  const account = typeof req.query.account === 'string' ? req.query.account : undefined

  return UserService.getValidationMessage(address, account)
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
    throw new Error('Invalid discord status')
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

async function getProfile(req: Request) {
  const address = validateAddress(req.params.address)
  return await UserService.getProfile(address)
}

async function unlinkAccount(req: WithAuth) {
  const address = req.auth!
  const { accountType } = req.body
  const accounts = validateAccountTypes(accountType)
  return await UserService.unlinkAccount(address, accounts[0])
}
