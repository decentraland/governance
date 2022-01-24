import unified from 'unified'
import markdown from 'remark-parse'
import stringify from 'remark-stringify'
import { Node } from 'unist'
import escapeMarkdown from 'markdown-escape'
import numeral from 'numeral'
import ProposalModel from '../model'
import { proposalUrl } from '../utils'
import { ProposalAttributes } from '../types'

export function template(raw: TemplateStringsArray, ...subs: any[]) {
  return String.raw(raw, ...subs)
    .trim()
}

export function formatBalance(value: number) {
  return numeral(value).format('0,0')
}

export async function formatLinkedProposal(linked_proposal_id: string) {
  const url = proposalUrl({id: linked_proposal_id})
  const proposal = await ProposalModel.findOne<ProposalAttributes>({id: linked_proposal_id, deleted: false})
  return `[${proposal?.title}](${url})` || ''
}

const parser = unified()
  .use(markdown)
  .use(stringify)

export function formatMarkdown(value: string): string {
  const tree = parser.parse(value)
  const result = parser.stringify(formatMarkdownAST(tree))
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
