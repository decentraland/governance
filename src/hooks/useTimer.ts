import { useCallback, useState } from 'react'

export default function useTimer(seconds: number) {
  const [currentTimer, setCurrentTimer] = useState<NodeJS.Timer>()
  const [time, setTime] = useState(seconds)

  const startTimer = useCallback(() => {
    if (currentTimer) {
      clearInterval(currentTimer)
    }
    setTime(seconds)

    if (seconds <= 0) {
      return
    }

    const timer = setInterval(() => {
      setTime((prevTime) => {
        const newTime = prevTime - 1
        if (newTime === 0) {
          clearInterval(timer)
        }
        return newTime
      })
    }, 1000)

    setCurrentTimer(timer)
  }, [currentTimer, seconds])

  const resetTimer = useCallback(() => {
    if (currentTimer) {
      clearInterval(currentTimer)
    }
    setTime(seconds)
  }, [currentTimer, seconds])

  return {
    startTimer,
    resetTimer,
    time,
  }
}
