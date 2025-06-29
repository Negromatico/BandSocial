import React, { useState, useEffect } from 'react';
import ProfileForm from '../components/ProfileForm';
import { db, auth } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Spinner, Alert, Container, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) setShowAuthModal(true);
    else setShowAuthModal(false);
  }, [user]);

  const [status, setStatus] = useState('');
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setStatus('Debes iniciar sesión para editar tu perfil.');
      return;
    }
    try {
      const docRef = doc(db, 'perfiles', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setInitialValues(docSnap.data());
      }
    } catch (err) {
      setStatus('Error cargando perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const cleanProfileData = (data) => {
    const cleaned = { ...data };
    const arrayFields = ['generos', 'dias', 'instrumentos', 'buscan', 'horarios', 'fotos'];
    arrayFields.forEach(f => {
      if (cleaned[f] === undefined) cleaned[f] = [];
    });
    if (cleaned.ciudad === undefined) cleaned.ciudad = null;
    if (cleaned.videoUrl === undefined) cleaned.videoUrl = '';
    if (cleaned.miembros === undefined) cleaned.miembros = '';
    return cleaned;
  };

  const handleProfileSubmit = async (data) => {
    setStatus('');
    const user = auth.currentUser;
    if (!user) {
      setStatus('Debes iniciar sesión para guardar tu perfil.');
      console.error('No hay usuario autenticado al intentar guardar el perfil');
      return;
    }
    try {
      const cleanedData = cleanProfileData(data);
      await setDoc(doc(db, 'perfiles', user.uid), {
        ...cleanedData,
        uid: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString(),
      });
      setStatus('Perfil guardado correctamente ✔️');
      fetchProfile();
    } catch (err) {
      setStatus('Error guardando perfil: ' + (err.message || err.toString()));
      console.error('Error guardando perfil:', err);
    }
  };

  if (loading) return (
    <Container fluid style={{ padding: '32px 0', background: 'linear-gradient(120deg, #f3f0fa 60%, #ede9fe 100%)', minHeight: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status" />
        <div style={{ color: '#7c3aed', fontWeight: 500 }}>Cargando perfil...</div>
      </div>
    </Container>
  );

  return (
    <>
      <Modal show={showAuthModal} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center p-5">
          <h4 className="mb-3" style={{ color: '#7c3aed' }}>¡Bienvenido a BandSocial!</h4>
          <p>Debes iniciar sesión o registrarte para editar tu perfil.</p>
          <div className="d-flex gap-3 justify-content-center mt-4">
            <Button variant="primary" size="lg" onClick={() => navigate('/login')}>Iniciar sesión</Button>
            <Button variant="outline-primary" size="lg" onClick={() => navigate('/register')}>Registrarse</Button>
          </div>
        </Modal.Body>
      </Modal>
      {user && (
        <Container fluid="sm" className="px-2 px-md-0" style={{ maxWidth: 500, margin: '0 auto', marginTop: 24 }}>
          <div className="d-flex justify-content-center">
            <div className="card shadow p-3 p-md-4 w-100" style={{ borderRadius: 18, border: '1px solid #ede9fe', background: '#fff' }}>
              <div className="d-flex flex-column align-items-center mb-3">
                <div className="profile-avatar-responsive" style={{ background: '#a78bfa', borderRadius: '50%', width: 90, height: 90, maxWidth: '30vw', maxHeight: '30vw', minWidth: 64, minHeight: 64, boxShadow: '0 0 0 6px #ede9fe', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {initialValues?.fotoPerfil ? (
                    <img src={initialValues.fotoPerfil} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 40, color: '#fff', lineHeight: '90px' }}>🎵</span>
                  )}
                </div>
                <div className="mt-3 mb-1 text-center w-100" style={{ fontSize: 20, fontWeight: 700, color: '#7c3aed', wordBreak: 'break-word' }}>
                  {initialValues?.nombre || initialValues?.email || 'Mi perfil'}
                </div>
                <span className="badge bg-secondary mb-2" style={{ fontSize: 15 }}>{initialValues?.type === 'banda' ? 'Banda' : 'Músico'}</span>
              </div>
              {initialValues && (
                <ProfileForm onSubmit={handleProfileSubmit} defaultValues={initialValues} />
              )}
            </div>
          </div>
        </Container>
      )}
      {status && (
        <div className="mt-3">
          <div className={`alert ${status.includes('✔️') ? 'alert-success' : 'alert-danger'}`}>{status}</div>
        </div>
      )}
    </>
  );
};

export default Profile;
