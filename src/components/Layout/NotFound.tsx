import classNames from 'classnames'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import useFormatMessage from '../../hooks/useFormatMessage'
import Text from '../Common/Typography/Text'

import Head from './Head'
import './NotFound.css'

interface Props {
  className?: string
}

function NotFound({ className }: Props) {
  const t = useFormatMessage()
  const title = t('page.404.title')
  const description = t('page.404.description')
  return (
    <Container>
      <Head title={title} description={description} />
      <div className={classNames('NotFound', className)}>
        <Text className="NotFound__Title" weight="semi-bold">
          {title}
        </Text>
        <Text size="xl">{description}</Text>
      </div>
    </Container>
  )
}

export default NotFound
