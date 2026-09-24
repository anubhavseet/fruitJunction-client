import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    { name: 'Home', href: '/#home' },
    { name: 'Menu', href: '/menu', isRoute: true },
    { name: 'Products', href: '/#products' },
    { name: 'Services', href: '/#services' },
    { name: 'About Us', href: '/#about' },
    { name: 'Contact Us', href: '/#contact' },
  ];

  const handleNavClick = (item) => {
    setIsMobileMenuOpen(false);
    const href = typeof item === 'string' ? item : item.href;
    const isRoute = typeof item === 'object' ? item.isRoute : (href.startsWith('/') && !href.includes('#'));

    if (isRoute || (href.startsWith('/') && !href.includes('#'))) {
      navigate(href);
      return;
    }
    if (location.pathname === '/') {
      const hash = href.replace('/', '');
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/images/fruitJunction_logo.png" alt="Fruit Junction" className="logo-image" />
            <span className="logo-text">Fruit Junction</span>
          </Link>
        </div>

        <nav className="desktop-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item);
                  }}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          {/* Cart Button */}
          <button
            className="cart-btn"
            onClick={() => navigate('/cart')}
            aria-label="Shopping Cart"
          >
            <svg width="20" height="20" viewBox="0 0 15 15" fill="currentColor">
              <path d="M14.1,1.6C14,0.7,13.3,0,12.4,0H2.7C1.7,0,1,0.7,0.9,1.6L0.1,13.1c0,0.5,0.1,1,0.5,1.3C0.9,14.8,1.3,15,1.8,15h11.4c0.5,0,0.9-0.2,1.3-0.6c0.3-0.4,0.5-0.8,0.5-1.3L14.1,1.6zM13.4,13.4c0,0-0.1,0.1-0.2,0.1H1.8c-0.1,0-0.2-0.1-0.2-0.1c0,0-0.1-0.1-0.1-0.2L2.4,1.7c0-0.1,0.1-0.2,0.2-0.2h9.7c0.1,0,0.2,0.1,0.2,0.2l0.8,11.5C13.4,13.3,13.4,13.4,13.4,13.4z M10,3.2C9.6,3.2,9.2,3.6,9.2,4v1.5c0,1-0.8,1.8-1.8,1.8S5.8,6.5,5.8,5.5V4c0-0.4-0.3-0.8-0.8-0.8S4.2,3.6,4.2,4v1.5c0,1.8,1.5,3.2,3.2,3.2s3.2-1.5,3.2-3.2V4C10.8,3.6,10.4,3.2,10,3.2z" />
            </svg>
            <span className="cart-count">{cartCount}</span>
          </button>

          {/* Auth State Actions */}
          {isAuthenticated ? (
            <div className="user-menu-container" ref={userMenuRef}>
              <button
                className="user-profile-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User Menu"
              >
                <div className="user-avatar">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="user-name-label">{user?.name?.split(' ')[0]}</span>
                <svg
                  className={`dropdown-arrow ${isUserMenuOpen ? 'open' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-info">
                    <p className="dropdown-user-name">{user?.name}</p>
                    <p className="dropdown-user-email">{user?.email}</p>
                    <span className="user-role-badge">{user?.role}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link
                    to="/dashboard"
                    className="dropdown-item"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    📦 My Orders & Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="dropdown-item admin-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      🛡️ Admin Dashboard
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-header-buttons">
              <Link to="/login" className="btn-header-login">
                Sign In
              </Link>
              <Link to="/register" className="btn-header-register">
                Register
              </Link>
            </div>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={isMobileMenuOpen ? 'open' : ''}></span>
            <span className={isMobileMenuOpen ? 'open' : ''}></span>
            <span className={isMobileMenuOpen ? 'open' : ''}></span>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item);
                }}
              >
                {item.name}
              </a>
            </li>
          ))}
          <li className="mobile-divider"></li>
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  📦 My Dashboard
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    🛡️ Admin Panel
                  </Link>
                </li>
              )}
              <li>
                <button
                  className="mobile-logout-btn"
                  onClick={handleLogout}
                >
                  🚪 Sign Out ({user?.name})
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  Create Account
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;

