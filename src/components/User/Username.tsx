import React from 'react'
import { Link } from 'gatsby-plugin-intl'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Profile } from 'decentraland-gatsby/dist/utils/loader/profile'
import locations from '../../modules/locations'
import { ProposalAttributes } from '../../entities/Proposal/types'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

interface Props {
  className?: string
  profile?: Profile
  proposalUser?: ProposalAttributes['user']
}

export default function Username({ className, profile, proposalUser }: Props) {
  const hasProfileName = profile && profile.name

  return (
    <Link className={TokenList.join([className])} to={locations.balance({ address: proposalUser || '' })}>
      {hasProfileName && <Avatar size="mini" address={profile.ethAddress} style={{ marginRight: '.5rem' }} />}
      {hasProfileName}
      {!hasProfileName && !!proposalUser && (
        <Blockie scale={3} seed={proposalUser || ''}>
          <Address value={proposalUser || ''} />
        </Blockie>
      )}
    </Link>
  )
}
