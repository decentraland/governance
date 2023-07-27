import * as React from 'react'

import classNames from 'classnames'

import ToastCross from '../Icon/ToastCross'

import './Toast.css'

export enum ToastType {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export type ToastProps = {
  type?: ToastType
  title: string | JSX.Element
  body: string | JSX.Element
  timeout?: number
  className?: string
  onClose?: () => void
}

export class Toast extends React.PureComponent<ToastProps> {
  mounted = false
  closeTimeoutId: number | null = null

  componentDidMount(): void {
    this.mounted = true

    if (this.shouldCloseAfterTimeout()) {
      this.closeAfterTimeout()
    }
  }

  componentWillUnmount(): void {
    this.mounted = false
  }

  handleClose = (): void => {
    this.props.onClose && this.props.onClose()
  }

  closeAfterTimeout(): void {
    const { timeout } = this.props

    this.closeTimeoutId = window
      ? window.setTimeout(() => {
          if (this.mounted) {
            this.handleClose()
          }
          this.closeTimeoutId = null
        }, timeout)
      : null
  }

  shouldCloseAfterTimeout(): boolean {
    const { timeout } = this.props
    return timeout !== undefined && this.closeTimeoutId === null
  }

  render(): JSX.Element {
    const { title, body, className } = this.props
    return (
      <div className={classNames('DaoToast', className)}>
        <div className="DaoToast__Container">
          <div className="DaoToast__Text">
            <div className="DaoToast__Title">{title}</div>
            <div className="DaoToast__Body">{body}</div>
          </div>
          <div className="DaoToast__Close" onClick={this.handleClose}>
            <ToastCross />
          </div>
        </div>
      </div>
    )
  }
}
