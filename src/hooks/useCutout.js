import { useEffect, useState } from 'react'
import { cutoutImage } from '../utils/cutout'

export function useCutout(src, mode) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    cutoutImage(src, mode)
      .then((result) => {
        if (!cancelled) setUrl(result)
      })
      .catch((error) => {
        console.error(error)
      })
    return () => {
      cancelled = true
    }
  }, [src, mode])

  return url
}
