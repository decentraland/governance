import useFormatMessage from '../../../hooks/useFormatMessage'
import useGovernanceProfile from '../../../hooks/useGovernanceProfile'
import locations from '../../../utils/locations'
import InvertedButton from '../../Common/InvertedButton'
import Link from '../../Common/Typography/Link'
import Username from '../../Common/Username'
import ValidatedProfileCheck from '../../User/ValidatedProfileCheck'

import './AuthorDetails.css'
import AuthorDetailsStat from './AuthorDetailsStat'
import Section from './Section'

interface Props {
  address: string
}

export default function AuthorDetails({ address }: Props) {
  const t = useFormatMessage()
  const { profile, isLoadingGovernanceProfile } = useGovernanceProfile(address)

  return (
    <Section title={t('page.proposal_detail.author_details.title')}>
      <div className="AuthorDetails__UserContainer">
        <div className="AuthorDetails__UserInfo">
          <Username className="AuthorDetails__Avatar" variant="avatar" address={address} size="big" />
          <div className="AuthorDetails__Username">
            <Username className="AuthorDetails__Address" variant="address" address={address} size="big" />
            <div className="AuthorDetails__ValidatedIcon">
              <ValidatedProfileCheck forumUsername={profile?.forum_username} isLoading={isLoadingGovernanceProfile} />
            </div>
          </div>
        </div>
        <Link href={locations.profile({ address })}>
          <InvertedButton>{t('page.proposal_detail.author_details.view_profile')}</InvertedButton>
        </Link>
      </div>
      <div className="AuthorDetails__StatsContainer">
        <AuthorDetailsStat label="Grant stats" description="First-ever Grant Request" />
        <AuthorDetailsStat label="30-day participation" description="Voted on 23 proposals" />
      </div>
    </Section>
  )
}
