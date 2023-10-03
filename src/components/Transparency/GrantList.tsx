import { useMemo } from 'react'

import { Card } from 'decentraland-ui/dist/components/Card/Card'

import { ProposalStatus, ProposalType } from '../../entities/Proposal/types'
import { formatBalance } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import useProposals from '../../hooks/useProposals'
import locations from '../../utils/locations'
import Heading from '../Common/Typography/Heading'
import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'
import { DetailItem } from '../Proposal/View/DetailItem'

import './GrantList.css'
import ItemsList from './ItemsList'

type Props = {
  status: ProposalStatus
  title: string
}

const ITEMS_PER_PAGE = 5

export default function GrantList({ status, title }: Props) {
  const t = useFormatMessage()
  const { proposals: grantsList } = useProposals({
    type: ProposalType.Grant,
    status: status,
    page: 1,
    itemsPerPage: ITEMS_PER_PAGE,
  })
  const additionalGrants = useMemo(() => (grantsList ? grantsList.total - grantsList.data.length : 0), [grantsList])

  if (!grantsList) {
    return null
  }

  return (
    <Card.Content className="GrantList__Content">
      <Heading size="md" weight="semi-bold" className="GrantList__Total">
        {grantsList.total}
      </Heading>
      <Text size="sm" className="GrantList__Title">
        {title}
      </Text>
      <ItemsList>
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
          <Link href={locations.proposals({ type: ProposalType.Grant, status: status })} className="GrantList__Link">
            {t('page.transparency.funding.view_more', { count: additionalGrants })}
          </Link>
        )}
      </ItemsList>
    </Card.Content>
  )
}
