import Text from './Common/Typography/Text'

interface Props {
  children: string
}

export default function PostLabel({ children }: Props) {
  return (
    <Text size="sm" color="secondary" weight="semi-bold" style="italic">
      {children}
    </Text>
  )
}
