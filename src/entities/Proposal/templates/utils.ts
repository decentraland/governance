import unified from 'unified'
import markdown from 'remark-parse'
import stringify from 'remark-stringify'
import { Node } from 'unist'
import escapeMarkdown from 'markdown-escape'
import numeral from 'numeral'

export function template(raw: TemplateStringsArray, ...subs: any[]) {
  return String.raw(raw, ...subs)
    .trim()
    .replace(/(“|”|‘|’)/gi, function (char) {
      switch (char) {
        case '“': return `&ldquo;`
        case '”': return `&rdquo;`
        case '‘': return `&lsquo;`
        case '’': return `&rsquo;`
        default: return char
      }
    })
}

export function formatBalance(value: number) {
  return numeral(value).format('0,0')
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