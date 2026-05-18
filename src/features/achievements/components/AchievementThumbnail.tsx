import { useState } from 'react'
import { isRenderableImageSource } from '../utils/achievementImage'

interface AchievementThumbnailProps {
  readonly title: string
  readonly image?: string | null
  readonly className?: string
}

function deriveInitials(title: string): string {
  const parts = title.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return ((parts[0][0] ?? '') + (parts[1][0] ?? '')).toUpperCase()
  }
  return title.slice(0, 2).toUpperCase()
}

export function AchievementThumbnail({ title, image, className = '' }: AchievementThumbnailProps) {
  const [imgError, setImgError] = useState(false)

  const trimmedImage = image?.trim()
  const showImage = !imgError && !!trimmedImage && isRenderableImageSource(trimmedImage)

  if (showImage) {
    return (
      <img
        src={trimmedImage}
        alt={title}
        className={`rounded-xl object-cover flex-shrink-0 ${className}`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      className={`bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-xl flex items-center justify-center text-xl text-white flex-shrink-0 ${className}`}
    >
      {deriveInitials(title)}
    </div>
  )
}
