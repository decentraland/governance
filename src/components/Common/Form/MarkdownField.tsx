import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form'

import MDEditor, { MDEditorProps } from '@uiw/react-md-editor'
import classNames from 'classnames'

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
  return (
    <>
      <Controller
        control={control}
        name={name}
        defaultValue={defaultValue}
        rules={rules}
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        render={({ field: { ref, ...field } }) => (
          <MDEditor
            contentEditable={!disabled}
            minHeight={175}
            {...field}
            {...markdownProps}
            className={classNames(error && 'MarkdownEditor--error', 'MarkdownEditor')}
          />
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
