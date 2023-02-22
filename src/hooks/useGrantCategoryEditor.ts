import React, { useImperativeHandle } from 'react'

import { userModifiedForm } from '../entities/Proposal/utils'

export const useGrantCategoryEditor = (ref: React.ForwardedRef<unknown>, editor: any, state: any, initialValue: any) =>
  useImperativeHandle(
    ref,
    () => {
      return {
        validate() {
          editor.validate()
        },
        isValidated() {
          return state.validated
        },
        isFormEdited() {
          return userModifiedForm(state, initialValue)
        },
      }
    },
    [editor, state, initialValue]
  )
