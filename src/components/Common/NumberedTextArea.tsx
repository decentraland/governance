import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/mode-text'
import 'ace-builds/src-noconflict/theme-tomorrow'
import classNames from 'classnames'

import './NumberedTextArea.css'

interface Props {
  className?: string
  disabled?: boolean
  onInput?: (value?: string) => void
  value?: string
  errors?: { row: number; text: string }[]
}

function NumberedTextArea({ className, disabled, onInput, value, errors }: Props) {
  return (
    <AceEditor
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
      readOnly={disabled}
      onChange={(value) => onInput?.(value)}
      value={value}
      annotations={errors?.map((error) => ({ ...error, type: 'error', column: 0 }))}
    />
  )
}

export default NumberedTextArea
