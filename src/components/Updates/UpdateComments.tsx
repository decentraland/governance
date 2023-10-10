import { UpdateAttributes } from '../../entities/Updates/types'
import useUpdateComments from '../../hooks/useUpdateComments'
import Comments from '../Comments/Comments'

type UpdateComments = {
  update: UpdateAttributes
}

export default function UpdateComments({ update }: UpdateComments) {
  const { comments, isLoadingComments } = useUpdateComments(update.id, update.discourse_topic_id)

  if (!update.discourse_topic_id) {
    return null
  }

  return (
    <Comments
      comments={comments}
      isLoading={isLoadingComments}
      topicId={update.discourse_topic_id}
      topicSlug={update.discourse_topic_slug}
      topicType="update"
    />
  )
}
