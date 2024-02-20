import React, { useCallback, useEffect, useRef, useState } from 'react'

import classNames from 'classnames'
import { Radio } from 'decentraland-ui/dist/components/Radio/Radio'
import { omit } from 'lodash'

import ProposalMarkdown from '../../Proposal/View/ProposalMarkdown'

import './MarkdownTextArea.css'

type MarkdownTextarea = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  message?: string
  error?: boolean
  preview?: boolean
  previewLabel?: string
  minHeight?: number
}

export default function MarkdownTextarea({ preview, previewLabel, className, ...props }: MarkdownTextarea) {
  const ref = useRef<HTMLTextAreaElement | null>(null)
  const [previewing, setPreviewing] = useState(preview)

  const handleRowChange = useCallback(() => {
    if (!ref.current) {
      return
    }

    const textarea = ref.current
    textarea.style.height = 0 + 'px'
    let height = textarea.scrollHeight
    if (props.minHeight !== undefined && height < props.minHeight) {
      height = props.minHeight
    }

    textarea.style.height = height + 2 + 'px'
  }, [props.minHeight])

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    if (props.onChange) {
      props.onChange(event)
    }

    handleRowChange()
  }

  useEffect(() => handleRowChange(), [handleRowChange, previewing])

  return (
    <div className={classNames(['MarkdownTextArea', 'dcl', 'field', props.error && 'error', className])}>
      <div className="MarkdownTextarea__PreviewButtonContainer">
        <Radio
          toggle
          label={previewLabel ?? 'PREVIEW'}
          checked={preview ?? previewing}
          onChange={() => setPreviewing(!previewing)}
          style={{ position: 'absolute', right: 0, top: 0 }}
        />
      </div>
      {!previewing && (
        <div>
          <textarea
            {...omit(props, ['error', 'label', 'message'])}
            style={{ minHeight: props.minHeight || 72 }}
            className={classNames([
              'GovernanceTextArea',
              'GovernanceTextArea__Text',
              props.error && 'GovernanceTextArea--error',
              props.disabled && 'GovernanceTextArea--disabled',
            ])}
            ref={ref}
            onChange={handleChange}
          />
        </div>
      )}
      {previewing && (
        <div
          className={classNames('MarkdownTextarea__Preview', props.error && 'MarkdownTextArea__Preview--error')}
          style={{ minHeight: (props.minHeight || 72) + 'px' }}
        >
          <ProposalMarkdown text={String(props.value)} />
        </div>
      )}
      <div
        className={classNames(
          'MarkdownTextArea__MessageContainer',
          props.error && 'MarkdownTextArea__MessageContainer--error'
        )}
      >
        {props.error && <i aria-hidden="true" className="remove circle icon" />}
        <p className="message">{props.message}</p>
      </div>
    </div>
  )
}
