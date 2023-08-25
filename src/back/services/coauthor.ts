import CoauthorModel from '../../entities/Coauthor/model'
import { CoauthorStatus } from '../../entities/Coauthor/types'
import { isSameAddress } from '../../entities/Snapshot/utils'

export class CoauthorService {
  static async isCoauthor(proposalId: string, address: string): Promise<boolean> {
    const coauthors = await CoauthorModel.findCoauthors(proposalId, CoauthorStatus.APPROVED)
    return !!coauthors.find((coauthor) => isSameAddress(coauthor.address, address))
  }
}
