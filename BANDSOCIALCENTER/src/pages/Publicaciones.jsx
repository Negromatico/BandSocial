import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import PublicacionForm from '../components/PublicacionForm';
import { Tabs, Tab } from 'react-bootstrap';

const Publicaciones = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  // Escucha cambios de usuario logueado
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const fetchPublicaciones = async () => {
    setLoading(true);
    const q = query(collection(db, 'publicaciones'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setPublicaciones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  return (
    <div className="container px-2 px-md-0" style={{ maxWidth: 700, margin: '0 auto', padding: '24px 0' }}>
      <h2 className="mb-4" style={{ color: '#7c3aed', fontWeight: 700 }}>Publicaciones</h2>
      {user ? (
        <Tabs defaultActiveKey="lista" className="mb-3">
          <Tab eventKey="lista" title="Publicaciones">
            {loading ? (
              <div className="text-center">Cargando publicaciones...</div>
            ) : (
              <div>
                {publicaciones.length === 0 && <div>No hay publicaciones aún.</div>}
                {publicaciones.map(pub => {
                  const isOwner = user && pub.autorUid && user.uid && pub.autorUid === user.uid;
                  return (
                    <div key={pub.id} style={{
                      background: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 2px 8px rgba(124,58,237,0.08)',
                      padding: 20,
                      marginBottom: 20,
                      border: '1px solid #ede9fe',
                      position: 'relative',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 20, color: '#7c3aed' }}>{pub.titulo}</div>
                      <div style={{ color: '#6b7280', fontSize: 15 }}>{pub.tipo} | {pub.ciudad}</div>
                      <div style={{ margin: '8px 0', whiteSpace: 'pre-line' }}>{pub.descripcion}</div>
                      <div style={{ fontSize: 13, color: '#a78bfa' }}>Por: {pub.autorNombre || pub.autorUid}</div>
                      <div style={{ fontSize: 12, color: '#b5b5b5' }}>{pub.createdAt && pub.createdAt.toDate && pub.createdAt.toDate().toLocaleString()}</div>
                      {isOwner && (
                        <button
                          onClick={async () => {
                            if (window.confirm('¿Seguro que quieres eliminar esta publicación?')) {
                              await deleteDoc(doc(db, 'publicaciones', pub.id));
                              fetchPublicaciones();
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: 14,
                            right: 14,
                            background: '#f87171',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 12px',
                            fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Tab>
          <Tab eventKey="crear" title="Publicar">
            <div className="mb-4">
              <PublicacionForm onCreated={fetchPublicaciones} />
            </div>
          </Tab>
        </Tabs>
      ) : (
        <div>
          <h5 className="mb-4" style={{ color: '#7c3aed', fontWeight: 700 }}>Publicaciones</h5>
          {loading ? (
            <div className="text-center">Cargando publicaciones...</div>
          ) : (
            <div>
              {publicaciones.length === 0 && <div>No hay publicaciones aún.</div>}
              {publicaciones.map(pub => (
                <div key={pub.id} style={{
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(124,58,237,0.08)',
                  padding: 20,
                  marginBottom: 20,
                  border: '1px solid #ede9fe',
                  position: 'relative',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 20, color: '#7c3aed' }}>{pub.titulo}</div>
                  <div style={{ color: '#6b7280', fontSize: 15 }}>{pub.tipo} | {pub.ciudad}</div>
                  <div style={{ margin: '8px 0', whiteSpace: 'pre-line' }}>{pub.descripcion}</div>
                  <div style={{ fontSize: 13, color: '#a78bfa' }}>Por: {pub.autorNombre || pub.autorUid}</div>
                  <div style={{ fontSize: 12, color: '#b5b5b5' }}>{pub.createdAt && pub.createdAt.toDate && pub.createdAt.toDate().toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Publicaciones;
