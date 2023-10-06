import { Radio as DCLRadio, RadioProps } from 'decentraland-ui/dist/components/Radio/Radio'

import './RadioField.css'

interface Props {
  onClick: () => void
  label: string
}

export default function RadioField({ onClick, ...props }: Props & RadioProps) {
  return (
    <div className="RadioField" onClick={onClick}>
      <DCLRadio {...props} />
    </div>
  )
}
