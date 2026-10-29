import { assets } from '../../data/assets'
import CutoutImage from '../layout/CutoutImage'

export default function Buzzy({ mood = 'idle', variant = 'stage' }) {
  const celebrating = mood === 'win' || mood === 'fly'
  const trailing = celebrating || (variant === 'stage' && mood === 'spin')

  return (
    <div className={`buzzy is-${variant} is-${mood}`} aria-hidden="true">
      <div className="buzzy-body">
        <CutoutImage src={assets.mascot} mode="white" alt="" />
        <span className="buzzy-lid" />
      </div>
      {trailing ? (
        <div className={`buzzy-trail${celebrating ? ' is-flight' : ''}`} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : null}
      {celebrating ? (
        <>
          <div className="buzzy-sparkles" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="buzzy-honey" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </>
      ) : null}
    </div>
  )
}
