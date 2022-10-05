import React, { useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { DelegationResult, DetailedScores } from '../../clients/SnapshotGraphqlTypes'
import { OPEN_CALL_FOR_DELEGATES_LINK } from '../../constants'
import { useSortingByKey } from '../../hooks/useSortingByKey'
import Empty from '../Common/Empty'
import FullWidthButton from '../Common/FullWidthButton'
import SkeletonBars from '../Common/SkeletonBars'
import Scale from '../Icon/Scale'

import './DelegationCards.css'
import DelegatorCardProfile from './DelegatorCardProfile'
import { VotingPowerListModal } from './VotingPowerListModal'

interface Props {
  delegation: DelegationResult
  scores: DetailedScores
  isLoading?: boolean
  isUserProfile?: boolean
}

const MAX_DELEGATIONS_SHOWN = 6

function DelegationCards({ delegation, scores, isLoading, isUserProfile }: Props) {
  const t = useFormatMessage()
  const delegatedFrom = delegation.delegatedFrom
  const [showAllDelegations, setShowAllDelegations] = useState(false)
  const unsortedDelegationsList = useMemo(
    () =>
      delegatedFrom && delegatedFrom.length > 0 && Object.keys(scores).length !== 0
        ? delegatedFrom.map(({ delegator }) => {
            const delegatorAddress = delegator.toLowerCase()
            return { delegator, vp: (scores[delegatorAddress] && scores[delegatorAddress].ownVp) || 0 }
          })
        : [],
    [delegatedFrom, scores]
  )

  const { sorted: delegationsList, isDescendingSort, changeSort } = useSortingByKey(unsortedDelegationsList, 'vp')
  if (!isDescendingSort) {
    changeSort()
  }
  const delegationsToShow = useMemo(() => delegationsList.slice(0, MAX_DELEGATIONS_SHOWN), [delegationsList])
  const thereAreMoreDelegations = useMemo(
    () => unsortedDelegationsList.length > MAX_DELEGATIONS_SHOWN,
    [unsortedDelegationsList]
  )

  return (
    <div className="DelegationCards">
      {isLoading && <SkeletonBars amount={2} height={70} />}
      {!isLoading &&
        (delegationsToShow.length > 0 ? (
          <Grid columns={3} stackable>
            {delegationsToShow.map(({ delegator, vp }) => (
              <Grid.Column key={delegator}>
                <DelegatorCardProfile address={delegator} vp={vp} />
              </Grid.Column>
            ))}
          </Grid>
        ) : (
          <Empty
            className="DelegationsCards__EmptyContainer"
            icon={<Scale />}
            title={
              t(
                isUserProfile
                  ? `delegation.delegated_to_user_empty_title`
                  : `delegation.delegated_to_address_empty_title`
              ) || ''
            }
            description={t(`delegation.delegated_to_user_empty_description`) || ''}
            linkText={t('delegation.delegated_to_user_empty_link')}
            linkHref={OPEN_CALL_FOR_DELEGATES_LINK}
          />
        ))}

      {thereAreMoreDelegations && (
        <FullWidthButton onClick={() => setShowAllDelegations(true)}>
          {t('page.profile.delegators.button')}
        </FullWidthButton>
      )}
      <VotingPowerListModal
        open={showAllDelegations}
        delegations={delegationsList}
        onClose={() => setShowAllDelegations(false)}
      />
    </div>
  )
}

export default DelegationCards
