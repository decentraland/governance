import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import Catalyst from 'decentraland-gatsby/dist/utils/api/Catalyst'

export default class CatalystService {
  // TODO: This should throw a normal Error
  static async getProfile(user: string) {
    try {
      return await Catalyst.get().getProfile(user)
    } catch (err) {
      throw new RequestError(`Error getting profile "${user}"`, RequestError.InternalServerError, err as Error)
    }
  }
}
