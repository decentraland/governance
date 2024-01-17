type LoggerLevel = 'info' | 'warning' | 'error'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoggerData = Record<string, any>
type LoggerDataWithLevel = LoggerData & { level: LoggerLevel }

export class Logger {
  static write(message: string, data: LoggerDataWithLevel) {
    const method = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warn' : 'log'

    if ((process.env.NODE_ENV || 'development') === 'production') {
      console[method](JSON.stringify({ log: message, data }))
    } else {
      console[method](message, JSON.stringify(data, null, data.level === 'error' ? 2 : 0))
    }
  }

  private write(message: string, data: LoggerDataWithLevel) {
    const extended = { ...data }
    Logger.write(message, extended)
  }

  log(message: string, data: LoggerData = {}): void {
    return this.write(message, { level: 'info', data })
  }

  warn(message: string, data: LoggerData = {}): void {
    return this.write(message, { level: 'warning', data })
  }

  error(message: string, data: LoggerData = {}): void {
    if (data instanceof Error) {
      data = {
        ...data,
        message: data.message,
        stack: data.stack,
      }
    }

    return this.write(message, { level: 'error', data })
  }
}

export default new Logger()
