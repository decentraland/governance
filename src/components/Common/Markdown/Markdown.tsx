import React, { useMemo } from 'react'
import ReactMarkdown, { Components, Options } from 'react-markdown'

import classNames from 'classnames'
import { Radio } from 'decentraland-ui/dist/components/Radio/Radio'
import { Table } from 'decentraland-ui/dist/components/Table/Table'
import omit from 'lodash/omit'
import emoji from 'remark-emoji'
import gfm from 'remark-gfm'

import Link from '../Link/Link'
import Heading from '../Text/Heading'
import Text from '../Text/Text'

const plugins = [gfm, emoji] as any
type MarkdownKey = keyof Components
type MarkdownProps = Omit<Options, 'renders' | 'linkTarget' | 'astPlugins' | 'plugins'> & {
  componentsClassNames: Record<MarkdownKey, string>
}

function getComponents({ componentsClassNames }: MarkdownProps): Components {
  return {
    h1: (props) => (
      <Heading
        as="h1"
        {...omit(props, ['node'])}
        className={classNames([props.className, componentsClassNames['h1']])}
      />
    ),
    h2: (props) => (
      <Heading {...omit(props, ['node'])} className={classNames([props.className, componentsClassNames['h2']])} />
    ),
    h3: (props) => (
      <Heading
        as="h3"
        {...omit(props, ['node'])}
        className={classNames([props.className, componentsClassNames['h3']])}
      />
    ),
    p: (props) => <Text className={classNames([props.className, componentsClassNames['p']])} />,
    strong: (props) => <Text weight="bold" className={classNames([props.className, componentsClassNames['strong']])} />,
    em: (props) => <Text style="italic" className={classNames([props.className, componentsClassNames['em']])} />,
    a: (props) => <Link className={classNames([props.className, componentsClassNames['a']])} />,
    pre: (props) => (
      <pre {...omit(props, ['node'])} className={classNames([props.className, componentsClassNames['pre']])} />
    ),
    blockquote: (props) => (
      <blockquote {...props} className={classNames([props.className, componentsClassNames['blockquote']])} />
    ),
    input: ({ disabled, ...props }) => (
      <Radio
        readOnly={disabled}
        {...omit(props as any, ['node'])}
        className={classNames([props.className, componentsClassNames['input']])}
      />
    ),
    table: (props) => <Table basic="very">{props.children}</Table>,
    tbody: (props) => <Table.Body {...omit(props, ['node'])} />,
    thead: (props) => <Table.Header {...omit(props, ['node'])} />,
    tr: (props) => <Table.Row {...omit(props, ['node'])} />,
    th: (props) => <Table.HeaderCell {...omit(props as any, ['node', 'isHeader'])} />,
    td: (props) => <Table.Cell {...omit(props as any, ['node', 'isHeader'])} />,
  }
}

export default function Markdown(props: MarkdownProps) {
  const components = useMemo(() => getComponents(props), [props])
  return <ReactMarkdown {...props} components={components} remarkPlugins={plugins} />
}
