import { useCallback, useState } from 'react'

export default function useTimer(seconds: number) {
  const [currentTimer, setCurrentTimer] = useState<NodeJS.Timer>()
  const [time, setTime] = useState(seconds)

  const startTimer = useCallback(() => {
    if (currentTimer) {
      clearInterval(currentTimer)
    }
    setTime(seconds)

    const timerId = setInterval(() => {
      setTime((prevTime) => {
        const newTime = prevTime - 1
        if (newTime === 0) {
          clearInterval(timerId)
        }
        return newTime
      })
    }, 1000)

    setCurrentTimer(timerId)
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
