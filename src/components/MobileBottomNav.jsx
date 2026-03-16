import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaComments, FaBell, FaUser } from 'react-icons/fa';
import './MobileBottomNav.css';

const MobileBottomNav = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/buscar', icon: FaSearch, label: 'Buscar', isSearch: true },
    { path: '/messages', icon: FaComments, label: 'Mensajes' },
    { path: '/notifications', icon: FaBell, label: 'Notificaciones' },
    { path: '/profile', icon: FaUser, label: 'Perfil' }
  ];

  const handleNavigation = (path, isSearch) => {
    navigate(path);
    
    if (isSearch) {
      // Focus on search input when navigating to search page
      setTimeout(() => {
        const searchInput = document.querySelector('.search-input, input[type="search"], input[placeholder*="Buscar"]');
        if (searchInput) {
          searchInput.focus();
        }
      }, 300);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) return null;

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-container">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              className={`mobile-nav-item ${active ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path, item.isSearch)}
              aria-label={item.label}
            >
              <div className="mobile-nav-icon">
                <Icon />
              </div>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
