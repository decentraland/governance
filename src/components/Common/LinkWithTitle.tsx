import React from 'react'

import { useQuery } from '@tanstack/react-query'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { Governance } from '../../clients/Governance'
import Open from '../Icon/Open'

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
  }
}

function LinkWithTitle({ url }: Props) {
  const t = useFormatMessage()
  const { data: title } = useQuery({
    queryKey: [`title#${url}`],
    queryFn: () => fetchTitle(url),
    staleTime: 3.6e6, // 1 hour
  })

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="LinkWithTitle">
      {title || t('page.proposal_view.grant.relevant_link')} <Open />
    </a>
  )
}

export default LinkWithTitle
