import Catalyst from 'decentraland-gatsby/dist/utils/api/Catalyst'

export default class CatalystService {
  static async getProfile(user: string) {
    try {
      return await Catalyst.get().getProfile(user)
    } catch (err) {
      throw new Error(`Error getting profile "${user}"`, err as Error)
    }
  }
}
