import { useMemo } from 'react'
import ReactMarkdown, { Components, Options } from 'react-markdown'

import classNames from 'classnames'
import { Radio } from 'decentraland-ui/dist/components/Radio/Radio'
import { Table } from 'decentraland-ui/dist/components/Table/Table'
import omit from 'lodash/omit'
import emoji from 'remark-emoji'
import gfm from 'remark-gfm'

import Heading from './Heading'
import Link from './Link'
import List from './List'
import { ListItem } from './ListItem'
import Text, { FontSize } from './Text'

const plugins = [gfm, emoji] as any
type MarkdownKey = keyof Components
type MarkdownProps = Omit<Options, 'renders' | 'linkTarget' | 'astPlugins' | 'plugins'> & {
  componentsClassNames?: Partial<Record<MarkdownKey, string>>
  size?: FontSize
}

function getComponents({ size, componentsClassNames }: MarkdownProps): Components {
  return {
    h1: (props) => (
      <Heading
        as="h1"
        size="xl"
        {...omit(props, ['node', 'componentsClassNames'])}
        className={classNames([props.className, componentsClassNames && componentsClassNames['h1']])}
      />
    ),
    h2: (props) => (
      <Heading
        {...omit(props, ['node', 'componentsClassNames'])}
        className={classNames([props.className, componentsClassNames && componentsClassNames['h2']])}
      />
    ),
    h3: (props) => (
      <Heading
        as="h3"
        size="md"
        {...omit(props, ['node', 'componentsClassNames'])}
        className={classNames([props.className, componentsClassNames && componentsClassNames['h3']])}
      />
    ),
    p: (props) => (
      <Text size={size} className={classNames([props.className, componentsClassNames && componentsClassNames['p']])}>
        {props.children}
      </Text>
    ),
    strong: (props) => (
      <Text
        as="span"
        weight="bold"
        size={size}
        className={classNames([props.className, componentsClassNames && componentsClassNames['strong']])}
      >
        {props.children}
      </Text>
    ),
    em: (props) => (
      <Text
        as="span"
        style="italic"
        size={size}
        className={classNames([props.className, componentsClassNames && componentsClassNames['em']])}
      >
        {props.children}
      </Text>
    ),
    a: (props) => (
      <Link
        {...omit(props, ['node', 'componentsClassNames'])}
        className={classNames([props.className, componentsClassNames && componentsClassNames['a']])}
      />
    ),
    pre: (props) => (
      <pre
        {...omit(props, ['node', 'componentsClassNames'])}
        className={classNames([props.className, componentsClassNames && componentsClassNames['pre']])}
      />
    ),
    ol: (props) => (
      <List
        {...omit(props, ['node', 'componentsClassNames'])}
        className={classNames([props.className, componentsClassNames && componentsClassNames['ol']])}
        ordered
      />
    ),
    ul: (props) => (
      <List
        {...omit(props, ['node', 'componentsClassNames'])}
        className={classNames([props.className, componentsClassNames && componentsClassNames['ul']])}
      />
    ),
    li: (props) => (
      <ListItem
        {...omit(props, ['node', 'componentsClassNames'])}
        className={classNames([props.className, componentsClassNames && componentsClassNames['li']])}
      />
    ),
    blockquote: (props) => (
      <blockquote
        {...omit(props, ['node', 'componentsClassNames'])}
        className={classNames([props.className, componentsClassNames && componentsClassNames['blockquote']])}
      />
    ),
    input: ({ disabled, ...props }) => (
      <Radio
        readOnly={disabled}
        {...omit(props as any, ['node', 'componentsClassNames'])}
        className={classNames([props.className, componentsClassNames && componentsClassNames['input']])}
      />
    ),
    table: (props) => <Table basic="very">{props.children}</Table>,
    tbody: (props) => <Table.Body {...omit(props, ['node', 'componentsClassNames'])} />,
    thead: (props) => <Table.Header {...omit(props, ['node', 'componentsClassNames'])} />,
    tr: (props) => <Table.Row {...omit(props, ['node', 'componentsClassNames'])} />,
    th: (props) => <Table.HeaderCell {...omit(props as any, ['node', 'isHeader', 'componentsClassNames'])} />,
    td: (props) => <Table.Cell {...omit(props as any, ['node', 'isHeader', 'componentsClassNames'])} />,
  }
}

function Markdown(props: MarkdownProps) {
  const components = useMemo(() => getComponents(props), [props])
  return <ReactMarkdown {...props} components={components} remarkPlugins={plugins} />
}

export default Markdown
