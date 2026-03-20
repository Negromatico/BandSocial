import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaCalendar, FaGuitar, FaUsers, FaGamepad } from 'react-icons/fa';
import logo from '../assets/logo.png';
import './MobileTopNav.css';

const MobileTopNav = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navPages = [
    { path: '/', label: 'Inicio', icon: FaHome },
    { path: '/eventos', label: 'Eventos', icon: FaCalendar },
    { path: '/musicmarket', label: 'Market', icon: FaGuitar },
    { path: '/followers', label: 'Comunidad', icon: FaUsers },
    { path: '/juego', label: 'Juego', icon: FaGamepad }
  ];

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <div className="mobile-top-nav">
      <div className="mobile-top-nav-header">
        <img src={logo} alt="BandSocial" className="mobile-logo" onClick={() => navigate('/')} />
        <div className="mobile-header-actions">
          {/* Espacio para acciones adicionales si se necesitan */}
        </div>
      </div>
      
      <div className="mobile-nav-scroll-container">
        <div className="mobile-nav-tabs">
          {navPages.map((page) => {
            const Icon = page.icon;
            const active = isActive(page.path);
            
            return (
              <button
                key={page.path}
                className={`mobile-nav-tab ${active ? 'active' : ''}`}
                onClick={() => navigate(page.path)}
              >
                <Icon className="mobile-nav-tab-icon" />
                <span className="mobile-nav-tab-label">{page.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileTopNav;
