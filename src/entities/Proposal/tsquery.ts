import tsquery from 'pg-tsquery'

type Node = {
  type?: string
  negated: false
  value: string
  left?: Node
  right?: Node
  prefix: string
  quoted: false
}

function prefixNode(node?: Node): Node | undefined {
  if (node && !node.type && !node.prefix && !node.quoted && !node.negated) {
    node.prefix = ':*'
  }

  return node
}

function prefixChildNodes(node?: Node): Node | undefined {
  if (node && node.type !== '<->') {
    node.left = prefixNode(node.left)
    node.right = prefixNode(node.right)
  }

  return node
}

const Tsquery: any = (tsquery as any).Tsquery

const _parseOr = Tsquery.prototype.parseOr
Tsquery.prototype.parseOr = function (str: string) {
  return prefixChildNodes(_parseOr.call(this, str))
}

const _parseAnd = Tsquery.prototype.parseAnd
Tsquery.prototype.parseAnd = function (str: string) {
  return prefixChildNodes(_parseAnd.call(this, str))
}

const _parseFollowedBy = Tsquery.prototype.parseFollowedBy
Tsquery.prototype.parseFollowedBy = function (str: string) {
  return prefixChildNodes(_parseFollowedBy.call(this, str))
}

const _parse = Tsquery.prototype.parse
Tsquery.prototype.parse = function (str: string) {
  return prefixNode(_parse.call(this, str))
}

function createParser() {
  const parser = new Tsquery()
  return (str: string) => String(parser.parse(str) || '')
}

export default createParser()