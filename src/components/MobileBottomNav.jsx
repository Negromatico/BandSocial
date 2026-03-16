import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaPlus, FaBell, FaUser } from 'react-icons/fa';
import './MobileBottomNav.css';

const MobileBottomNav = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: FaHome, label: 'Inicio' },
    { path: '/buscar', icon: FaSearch, label: 'Buscar' },
    { path: '/create', icon: FaPlus, label: 'Crear', isCreate: true },
    { path: '/notifications', icon: FaBell, label: 'Notificaciones' },
    { path: '/profile', icon: FaUser, label: 'Perfil' }
  ];

  const handleNavigation = (path, isCreate) => {
    if (isCreate) {
      // Scroll to top to show create post form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Focus on create post textarea if exists
      setTimeout(() => {
        const textarea = document.querySelector('.create-post-card textarea');
        if (textarea) {
          textarea.focus();
        }
      }, 300);
    } else {
      navigate(path);
    }
  };

  const isActive = (path) => {
    if (path === '/create') return false;
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
              className={`mobile-nav-item ${active ? 'active' : ''} ${item.isCreate ? 'create-btn' : ''}`}
              onClick={() => handleNavigation(item.path, item.isCreate)}
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
