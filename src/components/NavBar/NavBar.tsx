import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import Icon from '../../assets/Icon.png';
import styles from './NavBar.module.css';

export default function NavBar() {
  const scrollDirection = useScrollDirection();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (location.pathname !== '/') {
    return null;
  }

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getNavClass = () => {
    if (scrollDirection === 'top') return styles.navbarTop;
    if (scrollDirection === 'up') return styles.navbarUp;
    return styles.navbarDown;
  };

  return (
    <nav className={`${styles.navbar} ${getNavClass()}`}>
      <Link to="/" onClick={handleLogoClick} className={styles.brand}>
        <img src={Icon} alt="DACHESS Logo" className={styles.logo} />
        <span className={styles.brandText}>
          DA<span className={styles.brandHighlight}>CHESS</span>
        </span>
      </Link>

      <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
        <a 
          className={styles.navLink} 
          onClick={(e) => {
            e.preventDefault();
            handleScrollTo('engine-playground');
          }}
          href="#engine-playground"
        >
          Live Demo
        </a>
        <Link to="/puzzles" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>
          Practice Puzzles
        </Link>
        <a 
          className={styles.ctaButton} 
          onClick={(e) => {
            e.preventDefault();
            handleScrollTo('contact');
          }}
          href="#contact"
        >
          Become a Partner
        </a>
      </div>

      <button className={styles.hamburger} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.line1Open : ''}`}></span>
        <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.line2Open : ''}`}></span>
        <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.line3Open : ''}`}></span>
      </button>
    </nav>
  );
}
