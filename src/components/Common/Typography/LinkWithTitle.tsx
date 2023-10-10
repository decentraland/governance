import { useQuery } from '@tanstack/react-query'

import { Governance } from '../../../clients/Governance'
import { DEFAULT_QUERY_STALE_TIME } from '../../../hooks/constants'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Open from '../../Icon/Open'

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
    <a href={url} target="_blank" rel="noopener noreferrer" className="LinkWithTitle">
      {title || t('page.proposal_view.grant.relevant_link')} <Open />
    </a>
  )
}

export default LinkWithTitle
