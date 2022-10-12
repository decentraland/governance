import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { DelegationResult } from '../../clients/SnapshotGraphqlTypes'
import Empty from '../Common/Empty'
import SkeletonBars from '../Common/SkeletonBars'
import DelegatorCardProfile from '../Delegation/DelegatorCardProfile'
import Scale from '../Icon/Scale'

import { ProfileBox } from './ProfileBox'
import './VpDelegationBox.css'

interface Props {
  delegation: DelegationResult
  isLoadingDelegations: boolean
  ownVp: number | undefined
  isLoadingOwnVp: boolean
}

function VpDelegationBox({ delegation, isLoadingDelegations, ownVp, isLoadingOwnVp }: Props) {
  const t = useFormatMessage()

  const isLoading = isLoadingDelegations || isLoadingOwnVp
  const { delegatedTo } = delegation

  return (
    <Container className="VpDelegationBox">
      <ProfileBox title={t('page.profile.delegation.title')} info={t('page.profile.delegation.helper')}>
        {isLoading && <SkeletonBars amount={1} height={70} />}
        {!isLoading && (
          <>
            {delegatedTo.length > 0 && ownVp ? (
              <Grid columns={3} stackable>
                {delegatedTo.map(({ delegate }) => (
                  <Grid.Column key={delegate}>
                    <DelegatorCardProfile address={delegate} vp={ownVp} />
                  </Grid.Column>
                ))}
              </Grid>
            ) : (
              <Empty
                className="DelegationsCards__EmptyContainer"
                icon={<Scale />}
                title={t('delegation.delegation_empty_title') || ''}
                description={t('delegation.delegation_address_empty') || ''}
              />
            )}
          </>
        )}
      </ProfileBox>
    </Container>
  )
}

export default VpDelegationBox
