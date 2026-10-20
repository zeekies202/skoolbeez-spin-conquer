import { useCutout } from '../../hooks/useCutout'

export default function CutoutImage({ src, mode = 'white', alt = '', className = '' }) {
  const url = useCutout(src, mode)

  if (!url) {
    return <span className={`cutout-pending ${className}`.trim()} aria-hidden="true" />
  }

  return <img className={className} src={url} alt={alt} draggable="false" />
}
