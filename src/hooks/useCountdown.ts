import { useEffect, useState } from 'react'

import Time from '../utils/date/Time'

export type Countdown = {
  /** days until the countdown finish [>=0] */
  days: number

  /** hours until days prop decreases [>=0]  */
  hours: number

  /** minutes until hours prop decreases [>=0]  */
  minutes: number

  /** seconds until minutes prop decreases [>=0]  */
  seconds: number

  /** milliseconds until seconds decreases [>=0]  */
  milliseconds: number

  /** milliseconds until the countdown finish [>=0] */
  time: number
}

export default function useCountdown(until: Pick<Date, 'getTime'>): Countdown {
  const [now, setNow] = useState(Date.now())
  const finished = until.getTime() <= now
  const time = finished ? 0 : until.getTime() - now

  useEffect(() => {
    if (finished) {
      return
    }

    const interval = setInterval(() => setNow(Date.now()), Time.Second)
    return () => clearInterval(interval)
  }, [finished])

  const days = (time / Time.Day) | 0
  const hours = ((time % Time.Day) / Time.Hour) | 0
  const minutes = ((time % Time.Hour) / Time.Minute) | 0
  const seconds = ((time % Time.Minute) / Time.Second) | 0
  const milliseconds = time % Time.Second | 0

  return {
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    time,
  }
}
