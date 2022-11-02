import { Discourse, DiscoursePostInTopic } from '../../clients/Discourse'

export async function fetchAllComments(discourseTopicId: number) {
  const DISCOURSE_BATCH_SIZE = 20
  const topic = await Discourse.get().getTopic(discourseTopicId)
  let allComments: DiscoursePostInTopic[] = topic.post_stream.posts //first 20
  let skip = DISCOURSE_BATCH_SIZE - 1
  if (topic.post_stream.stream.length > DISCOURSE_BATCH_SIZE) {
    let hasNext = true
    try {
      while (hasNext) {
        const postIds = topic.post_stream.stream.slice(skip, skip + DISCOURSE_BATCH_SIZE)
        const newPostsResponse = await Discourse.get().getPosts(discourseTopicId, postIds)
        const newComments = newPostsResponse.post_stream.posts
        allComments = [...allComments, ...newComments]
        if (newComments.length < DISCOURSE_BATCH_SIZE) {
          hasNext = false
        } else {
          skip = allComments.length
        }
      }
    } catch (error) {
      console.error(`Error while fetching discourse posts in batches: `, error)
    }
  }
  return allComments
}
