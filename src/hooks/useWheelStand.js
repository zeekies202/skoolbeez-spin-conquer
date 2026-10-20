import { useEffect, useState } from 'react'
import { cutWheelDisc, cutWheelStand } from '../utils/checkerCutout'

export function useWheelStand(src) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    cutWheelStand(src)
      .then((result) => {
        if (!cancelled) setUrl(result)
      })
      .catch((error) => {
        console.error(error)
      })
    return () => {
      cancelled = true
    }
  }, [src])

  return url
}

export function useWheelDisc(src) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    cutWheelDisc(src)
      .then((result) => {
        if (!cancelled) setUrl(result)
      })
      .catch((error) => {
        console.error(error)
      })
    return () => {
      cancelled = true
    }
  }, [src])

  return url
}
