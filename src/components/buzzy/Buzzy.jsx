import { assets } from '../../data/assets'
import CutoutImage from '../layout/CutoutImage'

export default function Buzzy({ mood = 'idle', variant = 'stage' }) {
  return (
    <div className={`buzzy is-${variant} is-${mood}`} aria-hidden="true">
      <div className="buzzy-body">
        <CutoutImage src={assets.mascot} mode="white" alt="" />
        <span className="buzzy-lid" />
      </div>
      {variant === 'stage' && mood === 'spin' ? (
        <div className="buzzy-trail" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : null}
    </div>
  )
}
