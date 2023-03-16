import React from 'react'
import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form'

import { Field as DCLField, FieldProps } from 'decentraland-ui'

interface Props<T extends FieldValues> extends FieldProps {
  control: Control<T>
  name: Path<T>
  defaultValue?: PathValue<T, Path<T>> | undefined
  rules?: any
}

function Field<T extends FieldValues>({ control, name, defaultValue, rules, ...rest }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field: { ref, ...field } }) => <DCLField {...field} {...rest} />}
    />
  )
}

export default Field
