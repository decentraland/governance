import Markdown from '../../Common/Typography/Markdown'

import './ProposalMarkdown.css'

const PROPOSAL_MARKDOWN_STYLES = {
  h2: 'ProposalMarkdown__Description__Title',
  h3: 'ProposalMarkdown__Description__SubTitle',
  p: 'ProposalMarkdown__Description__Text',
  li: 'ProposalMarkdown__Description__ListItem',
  a: 'ProposalMarkdown__BreakAnywhere',
}
interface Props {
  text: string
  className?: string
}

export default function ProposalMarkdown({ text, className }: Props) {
  return (
    <Markdown className={className} componentsClassNames={PROPOSAL_MARKDOWN_STYLES}>
      {text}
    </Markdown>
  )
}
