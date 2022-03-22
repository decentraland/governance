import unified from 'unified'
import markdown from 'remark-parse'
import stringify from 'remark-stringify'
import escapeMarkdown from 'markdown-escape'
import ProposalModel from '../model'
import { proposalUrl } from '../utils'
import { ProposalAttributes } from '../types'

type NodeItem = {
  type: string;
  depth?: number
}

type Node = {
  type: string;
  depth: number;
  children: NodeItem[]
}

export function template(raw: TemplateStringsArray, ...subs: any[]) {
  return String.raw(raw, ...subs)
    .trim()
}

export async function formatLinkedProposal(linked_proposal_id: string) {
  const url = proposalUrl({ id: linked_proposal_id })
  const proposal = await ProposalModel.findOne<ProposalAttributes>({ id: linked_proposal_id, deleted: false })
  return `[${proposal?.title}](${url})` || ''
}

const parser = unified()
  .use(markdown)
  .use(stringify)

export function formatMarkdown(value: string): string {
  const tree = parser.parse(value)
  const result = parser.stringify(formatMarkdownAST(tree as Node))
  return result
}

export function formatMarkdownAST(node: Node): Node {
  switch (node.type) {
    case 'heading':
      return {
        ...node,
        depth: (node.depth as number) < 3 ? 3 : (node.depth as number),
        children: node.children && (node.children as Node[]).map(node => formatMarkdownAST(node))
      }
    default:
      return {
        ...node,
        children: node.children && (node.children as Node[]).map(node => formatMarkdownAST(node))
      }
  }
}

export { escapeMarkdown }
