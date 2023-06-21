import React from 'react'
import ReactMarkdown, { Components, Options } from 'react-markdown'

import classNames from 'classnames'
import { Radio } from 'decentraland-ui/dist/components/Radio/Radio'
import { Table } from 'decentraland-ui/dist/components/Table/Table'
import omit from 'lodash/omit'
import emoji from 'remark-emoji'
import gfm from 'remark-gfm'

import Text from '../Text/Text'

import Code from './Code'
import Link from './Link'
import List, { ListItem } from './List'
import MainTitle from './MainTitle'
import SubTitle from './SubTitle'
import Title from './Title'

export const plugins = [gfm, emoji] as any
type MarkdownKey = keyof Components
export type MarkdownProps = Omit<Options, 'renders' | 'linkTarget' | 'astPlugins' | 'plugins'> & {
  componentsClassNames: Record<MarkdownKey, string>
}

function getComponents({ componentsClassNames }: MarkdownProps): Components {
  return {
    h1: (props) => <MainTitle {...omit(props, ['node', 'level'])} />,
    h2: (props) => <Title {...props} />,
    h3: (props) => <SubTitle {...props} />,
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    del: 'del',
    p: (props) => <Text className={classNames([props.className, componentsClassNames['p']])} />,
    strong: (props) => <Text weight="bold" className={classNames([props.className, componentsClassNames['strong']])} />,
    em: (props) => <Text style="italic" className={classNames([props.className, componentsClassNames['em']])} />,
    a: (props) => <Link {...omit(props, ['node'])} />,
    code: (props) => {
      const result = (props.className || '').match(/^language-(\w+)$/)
      const language = result ? result[1] : undefined
      return <Code language={language} {...omit(props as any, ['node'])} />
    },
    pre: (props) => <pre {...omit(props, ['node'])} />,
    blockquote: (props) => (
      <blockquote {...props} className={classNames([props.className, componentsClassNames['blockquote']])} />
    ),
    ol: (props) => <List {...omit(props, ['node'])} />,
    ul: (props) => <List {...omit(props, ['node'])} />,
    li: (props) => <ListItem {...omit(props, ['node'])} />,
    input: ({ disabled, ...props }) => <Radio readOnly={disabled} {...omit(props as any, ['node'])} />,
    table: (props) => <Table basic="very">{props.children}</Table>,
    tbody: (props) => <Table.Body {...omit(props, ['node'])} />,
    thead: (props) => <Table.Header {...omit(props, ['node'])} />,
    tr: (props) => <Table.Row {...omit(props, ['node'])} />,
    th: (props) => <Table.HeaderCell {...omit(props as any, ['node', 'isHeader'])} />,
    td: (props) => <Table.Cell {...omit(props as any, ['node', 'isHeader'])} />,
  }
}

export default function Markdown(props: MarkdownProps) {
  return <ReactMarkdown {...props} components={getComponents(props)} remarkPlugins={plugins} />
}
