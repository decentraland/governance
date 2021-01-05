export enum EmbedType {
  Topic = 'forum.decentraland.org/topic',
  LoomVideo = 'loom.com/video'
}

export type Embed =
  | EmbedTopic
  | EmbedLoomVideo

export type EmbedTopic = {
  url: string,
  type: EmbedType.Topic,
  content: {
    "id": number,
    "name": string,
    "username": string,
    "avatar_template": string,
    "created_at": string,
    "cooked": string,
    "post_number": number,
    "post_type": number,
    "updated_at": string,
    "reply_count": number,
    "reply_to_post_number": null,
    "quote_count": number,
    "incoming_link_count": number,
    "reads": number,
    "readers_count": number,
    "score": number,
    "yours": boolean,
    "topic_id": number,
    "topic_slug": string,
    "display_username": string,
    "version": number,
    "can_edit": boolean,
    "can_delete": boolean,
    "can_recover": boolean,
    "can_wiki": boolean,
    "link_counts": {
      "url": string,
      "internal": boolean,
      "reflection": boolean,
      "clicks": number
    }[],
    "read": boolean,
    "user_title": string,
    "bookmarked": boolean,
    "actions_summary": {
      "id": number,
      "count": number
    }[],
    "moderator": boolean,
    "admin": boolean,
    "staff": boolean,
    "user_id": number,
    "hidden": boolean,
    "trust_level": number,
    "deleted_at": null,
    "user_deleted": boolean,
    "edit_reason": null,
    "can_view_edit_history": boolean,
    "wiki": boolean,
    "calendar_details": [],
    "can_accept_answer": boolean,
    "can_unaccept_answer": boolean,
    "accepted_answer": boolean
  }
}

export type EmbedLoomVideo = {
  url: string,
  type: EmbedType.LoomVideo,
  content: string
}