import { DiscoursePost } from '../../clients/Discourse'
import UpdateModel from '../../entities/Updates/model'
import { UpdateAttributes } from '../../entities/Updates/types'

export class UpdateService {
  static async getById(id: UpdateAttributes['id']) {
    return await UpdateModel.findOne<UpdateAttributes>({ id })
  }

  static async update(id: UpdateAttributes['id'], discoursePost: DiscoursePost) {
    return await UpdateModel.update(
      { discourse_topic_id: discoursePost.topic_id, discourse_topic_slug: discoursePost.topic_slug },
      { id }
    )
  }
}
