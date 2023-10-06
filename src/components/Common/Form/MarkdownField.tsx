import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form'

import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import { FieldProps } from 'decentraland-ui/dist/components/Field/Field'

export interface MarkdownFieldProps<T extends FieldValues> extends FieldProps {
  control: Control<T>
  name: Path<T>
  defaultValue?: PathValue<T, Path<T>> | undefined
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
