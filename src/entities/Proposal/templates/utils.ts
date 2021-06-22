import unified from 'unified'
import markdown from 'remark-parse'
import stringify from 'remark-stringify'
import { Node } from 'unist'
import escapeMarkdown from 'markdown-escape'
import numeral from 'numeral'

const escape_map: Record<string, string> = {
  '¢': '&cent;',
  '£': '&pound;',
  '€': '&euro;',
  '¥': '&yen;',
  '§': '&sect;',
  '©': '&copy;',
  '®': '&reg;',
  '«': '&laquo;',
  '»': '&raquo;',
  '°': '&deg;',
  '±': '&plusmn;',
  '¶': '&para;',
  '·': '&middot;',
  '½': '&frac12;',
  '–': '&ndash;',
  '—': '&mdash;',
  '“': '&ldquo;',
  '”': '&rdquo;',
  '‘': '&lsquo;',
  '’': '&rsquo;',
  '‚': '&sbquo;',
  '„': '&bdquo;',
  '†': '&dagger;',
  '‡': '&Dagger;',
  '•': '&bull;',
  '…': '&hellip;',
  '′': '&prime;',
  '″': '&Prime;',
  '™': '&trade;',
  '≈': '&asymp;',
  '≠': '&ne;',
  '≤': '&le;',
  '≥': '&ge;',
  // '&': '&amp;',
}

const escape_regexp = new RegExp(`(${Object.keys(escape_map).join('|')})`, 'gi')

const escape_function = function (char: string) {
  return escape_map[char] || char
}

export function template(raw: TemplateStringsArray, ...subs: any[]) {
  return String.raw(raw, ...subs)
    .trim()
}

export function escapeEntities(value: string): string {
  return value.replace(escape_regexp, escape_function)
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