import React, { useMemo } from 'react'

import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ProposalStatus, ProposalType } from '../../entities/Proposal/types'
import { formatBalance } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import useProposals from '../../hooks/useProposals'
import locations from '../../utils/locations'
import Link from '../Common/Link'
import { DetailItem } from '../Proposal/View/DetailItem'

import './GrantList.css'

export type GrantListProps = React.HTMLAttributes<HTMLDivElement> & {
  status: ProposalStatus
  title: string
}

const ITEMS_PER_PAGE = 5

export default React.memo(function GrantList({ status, title }: GrantListProps) {
  const t = useFormatMessage()
  const { proposals: grantsList } = useProposals({
    type: ProposalType.Grant,
    status: status,
    page: 1,
    itemsPerPage: ITEMS_PER_PAGE,
  })
  const additionalGrants = useMemo(() => (grantsList ? grantsList.total - grantsList.data.length : 0), [grantsList])

  return (
    <>
      {grantsList && (
        <Card.Content className="GrantList__Content">
          <Header size="medium" className="GrantList__Total">
            {grantsList.total}
          </Header>
          <Header sub className="GrantList__Sub">
            {title}
          </Header>
          <div className="ItemsList">
            {grantsList.data &&
              grantsList.data.map((grant, index) => {
                return (
                  <DetailItem
                    name={grant.title}
                    value={'$' + formatBalance(grant.configuration.size)}
                    key={[title.trim(), index].join('::')}
                  />
                )
              })}
            {additionalGrants > 0 && (
              <Link
                href={locations.proposals({ type: ProposalType.Grant, status: status })}
                className="GrantList__Link"
              >
                {t('page.transparency.funding.view_more', { count: additionalGrants })}
              </Link>
            )}
          </div>
        </Card.Content>
      )}
    </>
  )
})
