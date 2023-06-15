import dayjs from 'dayjs'

declare module 'dayjs' {
  export const Millisecond: number
  export const Second: number
  export const Minute: number
  export const Hour: number
  export const Day: number
  export const Week: number
  export const Formats: {
    GoogleCalendar: string
    InputDate: string
    InputTime: string
  }

  export function date(value?: undefined | null): null
  export function date(value: string | number | Date | dayjs.Dayjs): Date
  export function date(value?: undefined | null | string | number | Date | dayjs.Dayjs): Date | null

  export const from: typeof dayjs
  export const isTime: typeof dayjs.isDayjs

  interface Dayjs {
    getTime(): number
    toJSON(): string
  }
}
