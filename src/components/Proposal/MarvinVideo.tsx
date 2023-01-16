import React, { useEffect, useRef, useState } from 'react'

import './MarvinVideo.css'

interface Props {
  proposalId: string
}

const MARVIN_VIDEOS_FOLDER = 'https://raw.githubusercontent.com/Decentraland-DAO/marvin/main/videos'

const MarvinVideo = ({ proposalId }: Props) => {
  const [hasVideo, setHasVideo] = useState(false)
  const videoUrl = `${MARVIN_VIDEOS_FOLDER}/${proposalId}.mp4`
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const checkVideo = async () => {
      const response = await fetch(videoUrl)
      if (response.ok) {
        setHasVideo(true)
      }
    }

    checkVideo()
  }, [videoUrl, proposalId])

  if (!hasVideo) {
    return null
  }

  const handleClick = () => {
    if (!videoRef.current) {
      return
    }

    if (videoRef.current.paused) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
  }

  return (
    <video
      id="localVideoStream"
      ref={videoRef}
      src={videoUrl}
      onClick={handleClick}
      className="MarvinVideo"
      width="100"
      height="100"
    />
  )
}

export default MarvinVideo
