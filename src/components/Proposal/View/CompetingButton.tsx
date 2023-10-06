import ChevronRight from '../../Icon/ChevronRight'

import './CompetingButton.css'

interface Props {
  onClick: () => void
  children: React.ReactText
}

export default function CompetingButton({ onClick, children }: Props) {
  return (
    <button className="CompetingButton" onClick={onClick}>
      <span className="CompetingButton__Title">{children}</span>
      <ChevronRight color="var(--black-400)" />
    </button>
  )
}
