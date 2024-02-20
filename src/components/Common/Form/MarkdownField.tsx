import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form'

import MarkdownTextarea, { MarkdownTextAreaProps } from './MarkdownTextArea'

export interface MarkdownFieldProps<T extends FieldValues> extends MarkdownTextAreaProps {
  control: Control<T>
  name: Path<T>
  defaultValue?: PathValue<T, Path<T>> | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: any
}

export default function MarkdownField<T extends FieldValues>({
  control,
  name,
  defaultValue,
  rules,
  ...markdownProps
}: MarkdownFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render={({ field: { ref, ...field } }) => <MarkdownTextarea minHeight={175} {...field} {...markdownProps} />}
    />
  )
}
