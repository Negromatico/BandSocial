import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { FaSignOutAlt, FaTimes } from 'react-icons/fa';
import './MobileLogoutButton.css';

const MobileLogoutButton = ({ user }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      <button
        className="mobile-logout-btn"
        onClick={() => setShowConfirm(true)}
        aria-label="Cerrar sesión"
      >
        <FaSignOutAlt />
      </button>

      {showConfirm && (
        <div className="mobile-logout-modal" onClick={() => setShowConfirm(false)}>
          <div className="mobile-logout-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="mobile-logout-close"
              onClick={() => setShowConfirm(false)}
            >
              <FaTimes />
            </button>
            <h4>¿Cerrar sesión?</h4>
            <p>¿Estás seguro que deseas cerrar sesión?</p>
            <div className="mobile-logout-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-logout"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileLogoutButton;
