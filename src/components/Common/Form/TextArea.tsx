import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form'

import {
  TextAreaField as DCLTextArea,
  TextAreaFieldProps,
} from 'decentraland-ui/dist/components/TextAreaField/TextAreaField'

interface Props<T extends FieldValues> extends TextAreaFieldProps {
  control: Control<T>
  name: Path<T>
  defaultValue?: PathValue<T, Path<T>> | undefined
  rules?: any
}

export default function TextArea<T extends FieldValues>({
  control,
  name,
  defaultValue,
  rules,
  ...fieldProps
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render={({ field: { ref, ...field } }) => <DCLTextArea {...field} {...fieldProps} />}
    />
  )
}
