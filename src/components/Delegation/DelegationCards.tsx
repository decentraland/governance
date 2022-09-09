import React, { useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { DelegationResult, DetailedScores } from '../../api/Snapshot'
import FullWidthButton from '../Common/FullWidthButton'

import './DelegationCards.css'
import DelegatorCardProfile from './DelegatorCardProfile'
import { VotingPowerListModal } from './VotingPowerListModal'

interface Props {
  delegation: DelegationResult
  scores: DetailedScores
}

const MAX_DELEGATIONS_SHOWN = 6

function createGroups<T>(array: T[], itemsPerGroup: number) {
  const groupsAmount = Math.ceil(array.length / itemsPerGroup)
  return new Array(groupsAmount).fill('').map((_, i) => array.slice(i * itemsPerGroup, (i + 1) * itemsPerGroup))
}

function DelegationCards({ delegation, scores }: Props) {
  const t = useFormatMessage()
  const delegatedFrom = delegation.delegatedFrom
  const [showAllDelegations, setShowAllDelegations] = useState(false)
  const delegationsList = useMemo(
    () =>
      delegatedFrom && delegatedFrom.length > 0 && Object.keys(scores).length !== 0
        ? delegatedFrom
            .map(({ delegator }) => {
              const delegatorAddress = delegator.toLowerCase()
              return { delegator, vp: (scores[delegatorAddress] && scores[delegatorAddress].ownVp) || 0 }
            })
            .sort((d1, d2) => (d1.vp > d2.vp ? -1 : d1.vp < d2.vp ? 1 : 0))
        : [],
    [delegatedFrom, scores]
  )
  const delegationsToShow = useMemo(() => delegationsList.slice(0, MAX_DELEGATIONS_SHOWN), [delegationsList])

  const areThereMoreDelegations = useMemo(() => delegationsList.length > MAX_DELEGATIONS_SHOWN, [delegationsList])

  return (
    <div className="DelegationCards">
      <Grid columns={3} stackable>
        {createGroups(delegationsToShow, 3).map((delegation, idx) => (
          <Grid.Row key={`delegation-row-${idx}`}>
            {delegation.map(({ delegator, vp }) => (
              <Grid.Column key={delegator}>
                <DelegatorCardProfile isLoading={true} address={delegator} vp={vp} />
              </Grid.Column>
            ))}
          </Grid.Row>
        ))}
      </Grid>
      {areThereMoreDelegations && (
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
