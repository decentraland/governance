import React, { useContext } from 'react'
import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form'

import MDEditor, { EditorContext, ICommand, MDEditorProps, commands, getCommands } from '@uiw/react-md-editor'
import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import rehypeSanitize from 'rehype-sanitize'

import useFormatMessage from '../../../hooks/useFormatMessage'
import ProposalMarkdown from '../../Proposal/View/ProposalMarkdown'

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

const EXCLUDED_COMMANDS = ['hr', 'comment', 'table', 'checked-list', 'codeBlock', 'help']

const getDisabledCommands = () => {
  return getCommands().map((command) => {
    return { ...command, buttonProps: { ...command.buttonProps, disabled: true, tabIndex: -1 } }
  })
}

const makeCommandsUnfocusable = (commands: ICommand[]) => {
  return commands.map((command) => {
    return command.buttonProps ? { ...command, buttonProps: { ...command.buttonProps, tabIndex: -1 } } : command
  })
}

function getExtraCommands(
  charsCount: ICommand,
  emptyButton: ICommand,
  togglePreviewButton: ICommand,
  disabled: boolean
) {
  return [charsCount, disabled ? emptyButton : togglePreviewButton, disabled ? emptyButton : commands.fullscreen]
}

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
  const t = useFormatMessage()

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
          tabIndex={-1}
        >
          {t('component.markdown_field.preview_button')}
        </Button>
      )
    }
    return (
      <Button
        type="button"
        className="MarkdownField__Command"
        data-name="edit"
        aria-label="Edit"
        onClick={click}
        tabIndex={-1}
      >
        {t('component.markdown_field.edit_button')}
      </Button>
    )
  }

  const CharsCountMessage = () => {
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
    icon: <CharsCountMessage />,
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
              height="100%"
              data-color-mode="light"
              {...field}
              {...markdownProps}
              preview={'edit'}
              highlightEnable={false}
              enableScroll={false}
              visibleDragbar={false}
              previewOptions={{
                rehypePlugins: [[rehypeSanitize]],
              }}
              defaultTabEnable={true}
              textareaProps={{ disabled: disabled }}
              components={{
                preview: (source: string) => <ProposalMarkdown text={source} />,
              }}
              className={classNames(error && 'MarkdownEditor--error', 'MarkdownEditor')}
              commandsFilter={(command: ICommand) => {
                return EXCLUDED_COMMANDS.some((name) => name === command.name) ? false : command
              }}
              commands={disabled ? getDisabledCommands() : makeCommandsUnfocusable(getCommands())}
              extraCommands={makeCommandsUnfocusable(
                getExtraCommands(charsCount, emptyButton, togglePreviewButton, disabled)
              )}
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
