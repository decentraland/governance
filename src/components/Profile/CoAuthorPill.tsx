import useFormatMessage from '../../hooks/useFormatMessage'
import Pill from '../Common/Pill'

interface Props {
  className?: string
  hasCoauthorRequests?: boolean
}

const CoAuthorPill = ({ className, hasCoauthorRequests }: Props) => {
  const t = useFormatMessage()
  const textKey = hasCoauthorRequests ? 'pending_request_label' : 'label'
  const text = t(`page.profile.activity.coauthoring.${textKey}`)

  return (
    <Pill className={className} size="sm" color="yellow" style={hasCoauthorRequests ? 'shiny' : 'outline'}>
      {text}
    </Pill>
  )
}

export default CoAuthorPill
