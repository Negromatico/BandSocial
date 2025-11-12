import React, { useState, useEffect } from 'react';
import { Container, Card, Tabs, Tab, Spinner, Button } from 'react-bootstrap';
import { FaUserFriends, FaUserPlus, FaUserMinus, FaUsers } from 'react-icons/fa';
import { db, auth } from '../services/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { notificarNuevoSeguidor } from '../services/notificationService';
import './Followers.css';

const Followers = () => {
  const [activeTab, setActiveTab] = useState('seguidores');
  const [seguidores, setSeguidores] = useState([]);
  const [siguiendo, setSiguiendo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFollow, setLoadingFollow] = useState({});
  const [siguiendoList, setSiguiendoList] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFollowersData();
  }, [user, navigate]);

  const fetchFollowersData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const perfilSnap = await getDoc(doc(db, 'perfiles', user.uid));
      
      if (perfilSnap.exists()) {
        const perfil = perfilSnap.data();
        const seguidoresIds = perfil.seguidores || [];
        const siguiendoIds = perfil.siguiendo || [];
        
        setSiguiendoList(siguiendoIds);

        // Obtener datos de seguidores
        const seguidoresData = await Promise.all(
          seguidoresIds.map(async (uid) => {
            try {
              const userSnap = await getDoc(doc(db, 'perfiles', uid));
              if (userSnap.exists()) {
                return {
                  uid,
                  ...userSnap.data()
                };
              }
              return null;
            } catch (error) {
              console.error('Error fetching follower:', error);
              return null;
            }
          })
        );

        // Obtener datos de siguiendo
        const siguiendoData = await Promise.all(
          siguiendoIds.map(async (uid) => {
            try {
              const userSnap = await getDoc(doc(db, 'perfiles', uid));
              if (userSnap.exists()) {
                return {
                  uid,
                  ...userSnap.data()
                };
              }
              return null;
            } catch (error) {
              console.error('Error fetching following:', error);
              return null;
            }
          })
        );

        setSeguidores(seguidoresData.filter(Boolean));
        setSiguiendo(siguiendoData.filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching followers data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeguir = async (userId) => {
    if (!user) return;

    setLoadingFollow(prev => ({ ...prev, [userId]: true }));
    
    try {
      const currentUserRef = doc(db, 'perfiles', user.uid);
      const otherUserRef = doc(db, 'perfiles', userId);
      
      const estaSiguiendo = siguiendoList.includes(userId);

      if (estaSiguiendo) {
        // Dejar de seguir
        await updateDoc(currentUserRef, {
          siguiendo: arrayRemove(userId)
        });
        await updateDoc(otherUserRef, {
          seguidores: arrayRemove(user.uid)
        });
        setSiguiendoList(prev => prev.filter(id => id !== userId));
        setSiguiendo(prev => prev.filter(u => u.uid !== userId));
      } else {
        // Seguir
        await updateDoc(currentUserRef, {
          siguiendo: arrayUnion(userId)
        });
        await updateDoc(otherUserRef, {
          seguidores: arrayUnion(user.uid)
        });
        setSiguiendoList(prev => [...prev, userId]);
        
        // Enviar notificación
        await notificarNuevoSeguidor(user.uid, userId);
        
        // Actualizar lista de siguiendo
        const userSnap = await getDoc(doc(db, 'perfiles', userId));
        if (userSnap.exists()) {
          setSiguiendo(prev => [...prev, { uid: userId, ...userSnap.data() }]);
        }
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error);
      alert('Error al actualizar. Intenta de nuevo.');
    } finally {
      setLoadingFollow(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderUserCard = (userData, showFollowButton = false) => (
    <div key={userData.uid} className="follower-card">
      <div 
        className="follower-avatar"
        onClick={() => navigate(`/profile/${userData.uid}`)}
        style={{ cursor: 'pointer' }}
      >
        {userData.fotoPerfil ? (
          <img src={userData.fotoPerfil} alt={userData.nombre} />
        ) : (
          <div className="avatar-placeholder">
            {getInitials(userData.nombre || userData.email)}
          </div>
        )}
      </div>
      
      <div className="follower-info">
        <div 
          className="follower-name"
          onClick={() => navigate(`/profile/${userData.uid}`)}
          style={{ cursor: 'pointer' }}
        >
          {userData.nombre || userData.email || 'Usuario'}
        </div>
        <div className="follower-type">
          {userData.type === 'musico' ? '🎸 Músico' : '🎵 Banda'}
        </div>
        {userData.ciudad && (
          <div className="follower-location">
            📍 {userData.ciudad.label || userData.ciudad}
          </div>
        )}
      </div>

      {showFollowButton && userData.uid !== user?.uid && (
        <Button
          variant={siguiendoList.includes(userData.uid) ? 'outline-secondary' : 'primary'}
          size="sm"
          onClick={() => handleSeguir(userData.uid)}
          disabled={loadingFollow[userData.uid]}
          className="follow-button"
        >
          {loadingFollow[userData.uid] ? (
            <Spinner animation="border" size="sm" />
          ) : siguiendoList.includes(userData.uid) ? (
            <>
              <FaUserMinus className="me-1" />
              Siguiendo
            </>
          ) : (
            <>
              <FaUserPlus className="me-1" />
              Seguir
            </>
          )}
        </Button>
      )}
    </div>
  );

  return (
    <Container className="followers-page py-4">
      <Card className="followers-card">
        <Card.Header className="followers-header">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h3 className="mb-1">
                <FaUserFriends className="me-2" />
                Conexiones
              </h3>
              <p className="mb-0 text-white-50">
                Gestiona tus seguidores y personas que sigues
              </p>
            </div>
            <div className="stats-badges">
              <div className="stat-badge">
                <FaUsers />
                <span>{seguidores.length} Seguidores</span>
              </div>
              <div className="stat-badge">
                <FaUserPlus />
                <span>{siguiendo.length} Siguiendo</span>
              </div>
            </div>
          </div>
        </Card.Header>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="followers-tabs"
        >
          <Tab 
            eventKey="seguidores" 
            title={
              <span>
                <FaUsers className="me-2" />
                Seguidores ({seguidores.length})
              </span>
            }
          >
            <div className="followers-content">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Cargando seguidores...</p>
                </div>
              ) : seguidores.length === 0 ? (
                <div className="empty-state">
                  <FaUsers size={60} style={{ color: '#d1d5db', marginBottom: '20px' }} />
                  <h5>Aún no tienes seguidores</h5>
                  <p className="text-muted">
                    Comparte tu perfil y crea contenido para atraer seguidores
                  </p>
                </div>
              ) : (
                <div className="followers-grid">
                  {seguidores.map(follower => renderUserCard(follower, true))}
                </div>
              )}
            </div>
          </Tab>

          <Tab 
            eventKey="siguiendo" 
            title={
              <span>
                <FaUserPlus className="me-2" />
                Siguiendo ({siguiendo.length})
              </span>
            }
          >
            <div className="followers-content">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Cargando...</p>
                </div>
              ) : siguiendo.length === 0 ? (
                <div className="empty-state">
                  <FaUserPlus size={60} style={{ color: '#d1d5db', marginBottom: '20px' }} />
                  <h5>No sigues a nadie aún</h5>
                  <p className="text-muted">
                    Explora músicos y bandas para seguir y conectar
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/musicos')}
                    className="mt-3"
                  >
                    Explorar Músicos
                  </Button>
                </div>
              ) : (
                <div className="followers-grid">
                  {siguiendo.map(following => renderUserCard(following, true))}
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </Card>
    </Container>
  );
};

export default Followers;
