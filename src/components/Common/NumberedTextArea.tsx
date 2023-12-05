import AceEditor from 'react-ace'
import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form'

import 'ace-builds/src-noconflict/mode-text'
import 'ace-builds/src-noconflict/theme-tomorrow'
import classNames from 'classnames'

import './NumberedTextArea.css'

interface Props<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  defaultValue?: PathValue<T, Path<T>> | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: any
  className?: string
}

function NumberedTextArea<T extends FieldValues>({ control, name, defaultValue, rules, className }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render={({ field: { ref, ...field } }) => (
        <AceEditor
          {...field}
          className={classNames('NumberedTextArea', className)}
          theme="tomorrow"
          width="100%"
          mode="text"
          minLines={15}
          maxLines={15}
          setOptions={{
            firstLineNumber: 0,
          }}
          showPrintMargin={false}
        />
      )}
    />
  )
}

export default NumberedTextArea
