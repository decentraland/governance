import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { forumUserUrl } from '../../entities/Proposal/utils'
import Link from '../Common/Typography/Link'
import ValidatedProfile from '../Icon/ValidatedProfile'

import './ValidatedProfileCheck.css'

interface Props {
  forumUsername?: string | null
  isLoading: boolean
}

export default function ValidatedProfileCheck({ forumUsername, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="ValidatedProfileCheck">
        <Loader active size="tiny" />
      </div>
    )
  }

  return (
    <>
      {!isLoading && !!forumUsername && (
        <Link href={forumUserUrl(forumUsername)} className="ValidatedProfileCheck">
          <ValidatedProfile className="ValidatedProfileCheck__Icon" />
        </Link>
      )}
    </>
  )
}
