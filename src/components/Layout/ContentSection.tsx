import classNames from 'classnames'

import './ContentSection.css'

export default function ContentSection(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames('ContentSection', props.className)} />
}
