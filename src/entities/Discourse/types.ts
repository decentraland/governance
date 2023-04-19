/* eslint-disable @typescript-eslint/no-explicit-any */
export type DiscourseConnetTokenBody = {
  payload: string
}

export type DiscourseAttributes = {
  address: string
  forum_id: number
  user_api_key_encrypted: string
  expiration_date: string
}

export interface DiscourseUser {
  errors?: string[]
  error_type?: string
  current_user?: {
    id: number
    username: string
    name: string
    avatar_template: string
    unread_notifications: number
    unread_private_messages: number
    unread_high_priority_notifications: number
    all_unread_notifications_count: number
    read_first_notification: boolean
    admin: boolean
    notification_channel_position: null
    moderator: boolean
    staff: boolean
    whisperer: boolean
    title: null
    any_posts: boolean
    trust_level: number
    can_send_private_email_messages: boolean
    can_send_private_messages: boolean
    can_edit: boolean
    can_invite_to_forum: boolean
    custom_fields: any
    muted_category_ids: any[]
    indirectly_muted_category_ids: any[]
    regular_category_ids: any[]
    tracked_category_ids: any[]
    watched_first_post_category_ids: any[]
    watched_category_ids: any[]
    watched_tags: any[]
    watching_first_post_tags: any[]
    tracked_tags: any[]
    muted_tags: any[]
    regular_tags: any[]
    dismissed_banner_key: null
    is_anonymous: boolean
    reviewable_count: number
    unseen_reviewable_count: number
    new_personal_messages_notifications_count: number
    read_faq: boolean
    previous_visit_at: Date
    seen_notification_id: number
    flair_group_id: null
    can_create_topic: boolean
    can_create_group: boolean
    link_posting_access: string
    top_category_ids: any[]
    groups: any[]
    second_factor_enabled: boolean
    ignored_users: any[]
    featured_topic: null
    do_not_disturb_until: null
    can_review: boolean
    draft_count: number
    pending_posts_count: number
    grouped_unread_notifications: { [key: string]: number }
    redesigned_user_menu_enabled: boolean
    custom_sidebar_sections_enabled: boolean
    new_new_view_enabled: boolean
    user_option: any
  }
}
