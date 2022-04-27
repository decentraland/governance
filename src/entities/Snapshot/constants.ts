import { snapshotUrl } from "../Proposal/utils"

export const SNAPSHOT_SPACE = process.env.GATSBY_SNAPSHOT_SPACE || ''
export const SNAPSHOT_ADDRESS = process.env.GATSBY_SNAPSHOT_ADDRESS || ''
export const SNAPSHOT_DURATION = Number(process.env.GATSBY_SNAPSHOT_DURATION || '')
export const SNAPSHOT_URL = process.env.GATSBY_SNAPSHOT_URL || ''
export const SNAPSHOT_QUERY_ENDPOINT = process.env.GATSBY_SNAPSHOT_QUERY_ENDPOINT || ''
export const EDIT_DELEGATE_SNAPSHOT_URL = snapshotUrl(`#/delegate/${SNAPSHOT_SPACE}`)