import { assets } from '../../data/assets'

export default function Layout({ children }) {
  return (
    <div className="game-shell">
      <div
        className="stage"
        style={{ backgroundImage: `url("${assets.background}")` }}
      >
        {children}
      </div>
    </div>
  )
}
