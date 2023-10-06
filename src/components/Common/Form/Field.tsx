import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form'

import { Field as DCLField, FieldProps } from 'decentraland-ui/dist/components/Field/Field'

interface Props<T extends FieldValues> extends FieldProps {
  control: Control<T>
  name: Path<T>
  defaultValue?: PathValue<T, Path<T>> | undefined
  rules?: any
}

export default function Field<T extends FieldValues>({ control, name, defaultValue, rules, ...fieldProps }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render={({ field: { ref, ...field } }) => <DCLField {...field} {...fieldProps} />}
    />
  )
}
