import React, { useContext } from 'react'
import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form'

import MDEditor, { EditorContext, ICommand, MDEditorProps, commands } from '@uiw/react-md-editor'
import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import rehypeSanitize from 'rehype-sanitize'

import Markdown from '../Typography/Markdown'

import './MarkdownField.css'
import './MarkdownTextArea.css'

export interface MarkdownFieldProps<T extends FieldValues> extends MDEditorProps {
  control: Control<T>
  name: Path<T>
  defaultValue?: PathValue<T, Path<T>> | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: any
  disabled: boolean
  error: boolean
  message: string
}

const EXCLUDED_COMMANDS = ['hr', 'comment', 'table', 'checked-list', 'help']

export default function MarkdownField<T extends FieldValues>({
  control,
  name,
  defaultValue,
  rules,
  disabled,
  error,
  message,
  ...markdownProps
}: MarkdownFieldProps<T>) {
  const TogglePreviewButton = () => {
    const { preview, dispatch } = useContext(EditorContext)
    const click = () => {
      !!dispatch &&
        dispatch({
          preview: preview === 'edit' ? 'preview' : 'edit',
        })
    }
    if (preview === 'edit') {
      return (
        <Button
          type="button"
          className="MarkdownField__Command"
          data-name="preview"
          aria-label="Preview"
          onClick={click}
        >
          {'Preview'}
        </Button>
      )
    }
    return (
      <Button type="button" className="MarkdownField__Command" data-name="edit" aria-label="Edit" onClick={click}>
        {'Edit'}
      </Button>
    )
  }

  const CharsCountButton = () => {
    const { fullscreen } = useContext(EditorContext)

    if (fullscreen) {
      return (
        <p
          className={classNames(
            error ? 'MarkdownTextArea__MessageContainer--error' : 'MarkdownTextArea__Message',
            'MarkdownField__CounterCommand'
          )}
        >
          {message}
        </p>
      )
    }
    return <></>
  }

  const togglePreviewButton = {
    name: 'preview',
    keyCommand: 'preview',
    value: 'preview',
    icon: <TogglePreviewButton />,
  }

  const emptyButton = {
    name: 'empty',
    keyCommand: 'empty',
    value: 'empty',
  }

  const charsCount = {
    name: 'charsCount',
    keyCommand: 'charsCount',
    value: 'charsCount',
    icon: <CharsCountButton />,
  }

  return (
    <>
      <Controller
        control={control}
        name={name}
        defaultValue={defaultValue}
        rules={rules}
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        render={({ field: { ref, ...field } }) => (
          <>
            <MDEditor
              contentEditable={false}
              minHeight={150}
              data-color-mode="light"
              {...field}
              {...markdownProps}
              preview={disabled ? 'preview' : 'edit'}
              previewOptions={{
                rehypePlugins: [[rehypeSanitize]],
              }}
              textareaProps={{ disabled: disabled }}
              components={{
                preview: (source: string) => (
                  <div style={{ minHeight: '100%' }}>
                    <Markdown>{source}</Markdown>
                  </div>
                ),
              }}
              className={classNames(error && 'MarkdownEditor--error', 'MarkdownEditor')}
              commandsFilter={(command: ICommand) => {
                return EXCLUDED_COMMANDS.some((name) => name === command.name) ? false : command
              }}
              extraCommands={[charsCount, disabled ? emptyButton : togglePreviewButton, commands.fullscreen]}
            />
          </>
        )}
      />
      <div className="MarkdownTextArea__MessageContainer">
        <p className={error ? 'MarkdownTextArea__MessageContainer--error' : 'MarkdownTextArea__Message'}>{message}</p>
      </div>
    </>
  )
}
