import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__brand">
          <h2>EcoPulse</h2>
          <p>Urban air quality intelligence for healthier living.</p>
        </div>

        <div className="footer__links">
          <Link to="/">Home</Link>
          <Link to="/prediction">Prediction</Link>
          <Link to="/about">About</Link>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} EcoPulse. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
