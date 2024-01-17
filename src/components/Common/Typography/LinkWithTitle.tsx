import { useQuery } from '@tanstack/react-query'

import { Governance } from '../../../clients/Governance'
import { DEFAULT_QUERY_STALE_TIME } from '../../../hooks/constants'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Open from '../../Icon/Open'

import Link from './Link'
import './LinkWithTitle.css'

interface Props {
  url: string
}

const fetchTitle = async (url: string) => {
  try {
    const response = await Governance.get().checkUrlTitle(url)
    return response.title || ''
  } catch (error) {
    console.error(error)
    return ''
  }
}

function LinkWithTitle({ url }: Props) {
  const t = useFormatMessage()
  const { data: title } = useQuery({
    queryKey: [`title#${url}`],
    queryFn: () => fetchTitle(url),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return (
    <Link href={url} className="LinkWithTitle">
      {title || t('page.proposal_view.grant.relevant_link')} <Open />
    </Link>
  )
}

export default LinkWithTitle
