import ProposalModel from '../entities/Proposal/model'
import SurveyTopicModel from '../entities/SurveyTopic/model'

export class SurveyTopicsService {
  static async getProposalSurveyTopics(id: string) {
    try {
      const proposal = await ProposalModel.getProposal(id)
      return await SurveyTopicModel.getSurveyTopic(proposal.type, proposal.configuration)
    } catch (e) {
      console.log(`Unable to find survey topics for proposal ${id}`)
      return []
    }
  }
}
