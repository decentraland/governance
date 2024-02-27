import React, { useContext } from 'react'
import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form'

import MDEditor, { EditorContext, MDEditorProps, commands } from '@uiw/react-md-editor'
import classNames from 'classnames'
import rehypeSanitize from 'rehype-sanitize'

import Markdown from '../Typography/Markdown'

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
  const Button = () => {
    const { preview, dispatch } = useContext(EditorContext)
    const click = () => {
      !!dispatch &&
        dispatch({
          preview: preview === 'edit' ? 'preview' : 'edit',
        })
    }
    if (preview === 'edit') {
      return <div onClick={click}>{'Preview'}</div>
    }
    return <div onClick={click}>{'Edit'}</div>
  }

  const codePreview = {
    name: 'preview',
    keyCommand: 'preview',
    value: 'preview',
    icon: <Button />,
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
              contentEditable={!disabled}
              minHeight={175}
              {...field}
              {...markdownProps}
              preview={'edit'}
              previewOptions={{
                rehypePlugins: [[rehypeSanitize]],
              }}
              components={{ preview: (source: string) => <Markdown>{source}</Markdown> }}
              className={classNames(error && 'MarkdownEditor--error', 'MarkdownEditor')}
              extraCommands={[codePreview, commands.fullscreen]}
            />
          </>
        )}
      />
      {error && (
        <div className="MarkdownTextArea__MessageContainer">
          <p className={'MarkdownTextArea__MessageContainer--error'}>{message}</p>
        </div>
      )}
    </>
  )
}
