import ProposalMarkdown from './ProposalMarkdown'

interface Props {
  title?: string
  body: string | string[]
  className?: string
}

function ProposalDescriptionItem({ title, body, className }: Props) {
  const formattedTitle = `## ${title}`
  const formattedBody = Array.isArray(body) ? body.map((it) => `- ${it}\n`).join('') : body

  const text = title ? `${formattedTitle}\n\n${formattedBody}` : formattedBody

  return <ProposalMarkdown text={text} className={className} />
}

export default ProposalDescriptionItem
