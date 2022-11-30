import ProposalModel from '../entities/Proposal/model'
import SurveyTopicModel from '../entities/SurveyTopic/model'

export class SurveyTopicsService {
  static async getProposalSurveyTopics(id: string) {
    const proposal = await ProposalModel.getProposal(id)
    return await SurveyTopicModel.getSurveyTopic(proposal)
  }
}
