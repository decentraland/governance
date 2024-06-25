import CoauthorModel from '../entities/Coauthor/model'
import { CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalAttributes } from '../entities/Proposal/types'
import { isSameAddress } from '../entities/Snapshot/utils'

export class CoauthorService {
  static async getAllFromProposalId(proposalId: ProposalAttributes['id'], status?: CoauthorStatus) {
    return await CoauthorModel.findCoauthors(proposalId, status || CoauthorStatus.APPROVED)
  }

  static async isCoauthor(proposalId: string, address: string): Promise<boolean> {
    const coauthors = await CoauthorModel.findCoauthors(proposalId, CoauthorStatus.APPROVED)
    return !!coauthors.find((coauthor) => isSameAddress(coauthor.address, address))
  }
}
