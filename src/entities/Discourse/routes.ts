import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { hashMessage, recoverAddress } from 'ethers/lib/utils'
import { Request, Response } from 'express'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import isDebugAddress from '../Debug/isDebugAddress'

import { DiscourseService } from './../../services/DiscourseService'

import { GATSBY_DISCOURSE_CONNECT_THREAD, MESSAGE_TIMEOUT_TIME } from './constants'
import DiscourseModel from './model'
import { ValidationMessage } from './types'

export default routes((route) => {
  const withAuth = auth()
  route.get('/is-profile-validated/:address', handleAPI(isProfileValidated))
  route.get('/validate-profile', withAuth, handleAPI(getValidationMessage))
  route.post('/validate-profile', withAuth, handleAPI(checkValidationMessage))
  route.delete('/validate-profile', withAuth, handleAPI(deleteValidation))
})

const VALIDATIONS_IN_PROGRESS: Record<string, ValidationMessage> = {}

function clearValidationInProgress(user: string) {
  const validation = VALIDATIONS_IN_PROGRESS[user]
  if (validation) {
    clearTimeout(validation.messageTimeout)
    delete VALIDATIONS_IN_PROGRESS[user]
  }
}

function formatValidationMessage(address: string, timestamp: string) {
  return `By signing and posting this message I'm linking my Decentraland DAO account ${address} with this Discourse forum account\n\nDate: ${timestamp}`
}

async function getValidationMessage(req: WithAuth) {
  const address = req.auth!
  const message = {
    address,
    timestamp: new Date().toISOString(),
  }

  const messageTimeout = setTimeout(() => {
    delete VALIDATIONS_IN_PROGRESS[address]
  }, MESSAGE_TIMEOUT_TIME)

  VALIDATIONS_IN_PROGRESS[address] = {
    ...message,
    messageTimeout,
  }

  return formatValidationMessage(address, message.timestamp)
}

async function checkValidationMessage(req: WithAuth) {
  const user = req.auth!
  try {
    const messageProperties = VALIDATIONS_IN_PROGRESS[user]
    if (!messageProperties) {
      throw new Error('Validation timed out')
    }

    const { address, timestamp } = messageProperties

    const comments = await DiscourseService.fetchAllComments(Number(GATSBY_DISCOURSE_CONNECT_THREAD))
    const timeWindow = new Date(new Date().getTime() - MESSAGE_TIMEOUT_TIME)

    const filteredComments = comments.filter((comment) => new Date(comment.created_at) > timeWindow)
    const validComment = filteredComments.find((comment) => {
      const addressRegex = new RegExp(address, 'i')
      const dateRegex = new RegExp(timestamp, 'i')

      return addressRegex.test(comment.cooked) && dateRegex.test(comment.cooked)
    })

    if (validComment) {
      const signatureRegex = /0x([a-fA-F\d]{130})/
      const signature = '0x' + validComment.cooked.match(signatureRegex)?.[1]
      const recoveredAddress = recoverAddress(hashMessage(formatValidationMessage(address, timestamp)), signature)

      if (recoveredAddress.toLowerCase() !== user) {
        throw new Error('Invalid signature')
      }

      await DiscourseModel.createConnection(user, validComment.user_id)
      clearValidationInProgress(user)
    }

    return {
      valid: !!validComment,
    }
  } catch (error) {
    throw new Error("Couldn't validate the user. " + error)
  }
}

async function isProfileValidated(req: Request) {
  const address = req.params.address
  if (!isEthereumAddress(address)) {
    return false
  }
  try {
    return await DiscourseModel.isProfileValidated(address)
  } catch (error) {
    throw new Error('Error while fetching validation data ' + error)
  }
}

// TODO: REMOVE BEFORE PRODUCTION
async function deleteValidation(req: WithAuth<Request<any, any, { address: string }>>, res: Response) {
  const user = req.auth!
  const { address } = req.body

  if (!isDebugAddress(user)) {
    res.send(401)
  }

  if (!isEthereumAddress(address)) {
    res.send(400)
  }

  return await DiscourseModel.deleteConnection(address)
}
