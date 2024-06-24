import { AirdropJobAttributes } from '../models/AirdropJob'

export enum AirdropJobStatus {
  PENDING = 'pending',
  FINISHED = 'finished',
  FAILED = 'failed',
}

export type AirdropOutcome = Pick<AirdropJobAttributes, 'status' | 'error' | 'recipients' | 'badge_spec'>
