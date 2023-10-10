import { useMemo, useState } from 'react'

import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { DelegationResult, DetailedScores, VpDistribution } from '../../clients/SnapshotTypes'
import useFormatMessage from '../../hooks/useFormatMessage'
import { useSortingByKey } from '../../hooks/useSortingByKey'
import FullWidthButton from '../Common/FullWidthButton'
import SkeletonBars from '../Common/SkeletonBars'

import { DelegatedToAddressEmptyCard } from './DelegatedToAddressEmptyCard'
import { DelegatedToUserEmptyCard } from './DelegatedToUserEmptyCard'
import './DelegationCards.css'
import DelegatorCardProfile from './DelegatorCardProfile'
import { VotingPowerListModal } from './VotingPowerListModal'

interface Props {
  delegation: DelegationResult
  scores: DetailedScores
  isLoading?: boolean
  isUserProfile?: boolean
  loggedUserVpDistribution: VpDistribution
  profileAddress: string
}

const MAX_DELEGATIONS_SHOWN = 6

function DelegationCards({
  delegation,
  scores,
  isLoading,
  isUserProfile,
  loggedUserVpDistribution,
  profileAddress,
}: Props) {
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
        ) : isUserProfile ? (
          <DelegatedToUserEmptyCard />
        ) : (
          <DelegatedToAddressEmptyCard userVp={loggedUserVpDistribution.own} profileAddress={profileAddress} />
        ))}

      {thereAreMoreDelegations && (
        <>
          <br />
          <FullWidthButton onClick={() => setShowAllDelegations(true)}>
            {t('page.profile.delegators.button')}
          </FullWidthButton>
        </>
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
