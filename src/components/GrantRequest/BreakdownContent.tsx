import { isHttpsURL } from '../../helpers'
import LinkWithTitle from '../Common/Typography/LinkWithTitle'

export interface BreakdownContentProps {
  description: string
  url?: string
}

const formatUrl = (url: string) => (isHttpsURL(url) ? url : `//${url}`)

function BreakdownContent({ description, url }: BreakdownContentProps) {
  return (
    <>
      <p>{description}</p>
      {url && <LinkWithTitle url={formatUrl(url)} />}
    </>
  )
}

export default BreakdownContent
