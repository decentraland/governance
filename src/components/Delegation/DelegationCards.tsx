import React, { useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { DelegationResult, DetailedScores } from '../../api/Snapshot'
import { OPEN_CALL_FOR_DELEGATES_LINK } from '../../constants'
import Empty from '../Common/Empty'
import FullWidthButton from '../Common/FullWidthButton'
import Scale from '../Icon/Scale'

import './DelegationCards.css'
import DelegatorCardProfile from './DelegatorCardProfile'
import { VotingPowerListModal } from './VotingPowerListModal'

interface Props {
  delegation: DelegationResult
  scores: DetailedScores
  isLoading?: boolean
}

const MAX_DELEGATIONS_SHOWN = 6

function createGroups<T>(array: T[], itemsPerGroup: number) {
  const groupsAmount = Math.ceil(array.length / itemsPerGroup)
  return new Array(groupsAmount).fill('').map((_, i) => array.slice(i * itemsPerGroup, (i + 1) * itemsPerGroup))
}

function DelegationCards({ delegation, scores, isLoading }: Props) {
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

  const [account] = useAuthContext()

  return (
    <div className="DelegationCards">
      {isLoading && (
        <>
          <Skeleton height={70} />
          <br />
          <Skeleton height={70} />
        </>
      )}
      {!isLoading &&
        (delegationsToShow.length > 0 ? (
          <Grid columns={3} stackable>
            {createGroups(delegationsToShow, 3).map((delegation, idx) => (
              <Grid.Row key={`delegation-row-${idx}`}>
                {delegation.map(({ delegator, vp }) => (
                  <Grid.Column key={delegator}>
                    <DelegatorCardProfile address={delegator} vp={vp} />
                  </Grid.Column>
                ))}
              </Grid.Row>
            ))}
          </Grid>
        ) : (
          <Empty
            icon={<Scale />}
            title={
              t(
                account ? `page.balance.delegated_to_user_empty_title` : `page.balance.delegated_to_address_empty_title`
              ) || ''
            }
            description={t(`page.balance.delegated_to_user_empty_description`) || ''}
            linkText={t('page.balance.delegated_to_user_empty_link')}
            linkHref={OPEN_CALL_FOR_DELEGATES_LINK}
          />
        ))}

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
