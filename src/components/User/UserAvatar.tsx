import React, { useCallback, useState } from 'react'

import { WearablePreview } from 'decentraland-ui'

import useProfile from '../../hooks/useProfile'

import './UserAvatar.css'

interface Props {
  address?: string
}

export default function UserAvatar({ address }: Props) {
  const [isLoadingWearablePreview, setIsLoadingWearablePreview] = useState(true)
  const [wearablePreviewError, setWearablePreviewError] = useState(false)
  const { hasDclProfile } = useProfile(address)
  const handleLoad = useCallback(() => {
    setIsLoadingWearablePreview(false)
    setWearablePreviewError(false)
  }, [])
  const handleError = useCallback((error) => {
    console.warn(error)
    setWearablePreviewError(true)
    setIsLoadingWearablePreview(false)
  }, [])

  if (!address || !hasDclProfile) {
    return null
  }

  return (
    <div className="UserAvatar__Container">
      <WearablePreview profile={address} onLoad={handleLoad} onError={handleError} background={'FFFFFF'} />
    </div>
  )
}
