import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import useFormatMessage from '../../../hooks/useFormatMessage'
import Avatar from '../../Common/Avatar'
import Markdown from '../../Common/Typography/Markdown'
import ForumBlue from '../../Icon/ForumBlue'
import LinkFailed from '../../Icon/LinkFailed'
import LinkSucceded from '../../Icon/LinkSucceded'
import ValidatedProfile from '../../Icon/ValidatedProfile'

import './PostConnection.css'

interface Props {
  address?: string
  isValidated: boolean
  onPostAction: () => void
}

// TODO: Abstract this component when new connections become available
function PostConnection({ address, isValidated, onPostAction }: Props) {
  const t = useFormatMessage()
  return (
    <Modal.Content>
      <div className="PostConnection__Icons">
        <Avatar address={address} size="huge" />
        {isValidated ? <LinkSucceded /> : <LinkFailed />}
        <ForumBlue />
      </div>
      <div className="PostConnection__Text">
        <Markdown
          componentsClassNames={{
            p: 'PostConnection__TextParagraph',
            strong: 'PostConnection__TextStrong',
          }}
        >
          {t(`modal.identity_setup.forum.${isValidated ? 'success' : 'error'}_text`)}
        </Markdown>
        <div className="PostConnection__Subtext">
          <Markdown
            size="sm"
            componentsClassNames={{
              p: 'PostConnection__SubtextParagraph',
              strong: 'PostConnection__SubtextStrong',
            }}
          >
            {t(`modal.identity_setup.forum.${isValidated ? 'success' : 'error'}_subtext`)}
          </Markdown>
          {isValidated && <ValidatedProfile />}
        </div>
      </div>
      <div className="PostConnection__Action">
        <Button primary onClick={onPostAction}>
          {t(`modal.identity_setup.forum.${isValidated ? 'success' : 'error'}_button`)}
        </Button>
      </div>
    </Modal.Content>
  )
}

export default PostConnection
