import { useCallback, useEffect, useMemo, useState } from 'react'

import { PreviewCamera, PreviewEmote } from '@dcl/schemas'
import { WearablePreview } from 'decentraland-ui/dist/components/WearablePreview/WearablePreview'

import useDclProfile from '../../hooks/useDclProfile'

import './UserAvatar.css'

interface Props {
  address?: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function UserAvatar({ address }: Props) {
  const [wearablePreviewController, setWearablePreviewController] = useState<any>()

  const { profile } = useDclProfile(address)
  const handleLoad = useCallback(() => {
    setWearablePreviewController(WearablePreview.createController('wearable-preview'))
  }, [])

  const handleError = useCallback((error) => {
    console.warn(error)
  }, [])

  const previewEmote = useMemo(() => {
    const poses = [PreviewEmote.DAB, PreviewEmote.FIST_PUMP, PreviewEmote.DANCE, PreviewEmote.HEAD_EXPLODE]
    return poses[(Math.random() * poses.length) | 0]
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (wearablePreviewController) {
        wearablePreviewController.emote.play()
      }
    }, 20000)

    return () => clearInterval(interval)
  }, [wearablePreviewController])

  if (!address || !profile.hasCustomAvatar) {
    return null
  }

  return (
    <div className="UserAvatar__Container">
      <WearablePreview
        id="wearable-preview"
        profile={address}
        onLoad={handleLoad}
        onError={handleError}
        background={'FFFFFF'}
        emote={previewEmote}
        disableAutoRotate={true}
        camera={PreviewCamera.STATIC}
      />
    </div>
  )
}
