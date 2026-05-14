import { useState } from 'react'
import { isRenderableImageSource } from '../../achievements/utils/achievementImage'

interface BadgeThumbnailProps {
  readonly title: string
  readonly image?: string | null
  readonly className?: string
}

function deriveInitials(title: string): string {
  const safeTitle = title.trim()

  if (!safeTitle) {
    return 'BG'
  }

  const parts = safeTitle.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return ((parts[0][0] ?? '') + (parts[1][0] ?? '')).toUpperCase()
  }
  return safeTitle.slice(0, 2).toUpperCase()
}

export function BadgeThumbnail({ title, image, className = '' }: BadgeThumbnailProps) {
  const [imgError, setImgError] = useState(false)
  const safeTitle = title?.trim() || 'Badge'
  const trimmedImage = image?.trim()
  const showImage = !imgError && !!trimmedImage && isRenderableImageSource(trimmedImage)

  if (showImage) {
    return (
      <img
        src={trimmedImage}
        alt={safeTitle}
        className={`rounded-2xl object-cover flex-shrink-0 ${className}`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      className={`bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-2xl flex items-center justify-center text-xl text-white flex-shrink-0 ${className}`}
    >
      {deriveInitials(safeTitle)}
    </div>
  )
}
