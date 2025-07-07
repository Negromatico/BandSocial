import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import PublicacionForm from '../components/PublicacionForm';
import { instrumentos } from '../data/opciones';
import ComentariosPublicacion from '../components/ComentariosPublicacion';
import ReaccionesPublicacion from '../components/ReaccionesPublicacion';
import { Tabs, Tab, Container, Button } from 'react-bootstrap';
import Eventos from './Eventos';

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
    let pubs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Buscar nombres de autor si no vienen
    const missingNames = pubs.filter(p => !p.autorNombre && p.autorUid);
    if (missingNames.length > 0) {
      const { getDoc, doc: docFirestore } = await import('firebase/firestore');
      const { db } = await import('../services/firebase');
      await Promise.all(missingNames.map(async pub => {
        try {
          const perfilSnap = await getDoc(docFirestore(db, 'perfiles', pub.autorUid));
          if (perfilSnap.exists()) {
            pub.autorNombre = perfilSnap.data().nombre || perfilSnap.data().email || pub.autorUid;
          } else {
            pub.autorNombre = pub.autorUid;
          }
        } catch {
          pub.autorNombre = pub.autorUid;
        }
      }));
    }
    setPublicaciones(pubs);
    setLoading(false);
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  console.log('Renderizando publicaciones', publicaciones.length, user);
  return (
    <Container fluid="sm" className="px-2 px-md-0" style={{ maxWidth: '900px', margin: '0 auto', marginTop: 24 }}>
      {user ? (
        <Tabs defaultActiveKey="lista" className="mb-3">
          <Tab eventKey="lista" title="Publicaciones">
            {loading ? (
              <div className="text-center">Cargando publicaciones...</div>
            ) : (
              <div>
                {publicaciones.length === 0 && <div>No hay publicaciones aún.</div>}
                <div>
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
                      {Array.isArray(pub.imagenesUrl) && pub.imagenesUrl.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, marginBottom: 10, overflowX: 'auto' }}>
                          {pub.imagenesUrl.map((img, i) => (
                            <img key={i} src={img} alt={`img${i}`} style={{ maxHeight: 220, borderRadius: 10, objectFit: 'cover', boxShadow: '0 2px 8px #e0e7ff', minWidth: 120, maxWidth: 220 }} />
                          ))}
                        </div>
                      )}
                      <div style={{ fontWeight: 700, fontSize: 20, color: '#7c3aed' }}>{pub.titulo}</div>
                      <div style={{ color: '#6b7280', fontSize: 15 }}>{pub.tipo} | {pub.ciudad}</div>
                      <div style={{ margin: '8px 0', whiteSpace: 'pre-line' }}>{pub.descripcion}</div>
                      <div style={{ fontSize: 13, color: '#a78bfa' }}>Por: {pub.autorNombre}</div>
                      <div style={{ fontSize: 12, color: '#b5b5b5' }}>{pub.createdAt && pub.createdAt.toDate && pub.createdAt.toDate().toLocaleString()}</div>
                      {user && pub.autorUid === user.uid && (
                        <Button
                          size="sm"
                          variant="danger"
                          style={{ position: 'absolute', top: 14, right: 14, background: '#f87171', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 13, cursor: 'pointer' }}
                          onClick={async () => {
                            if (window.confirm('¿Seguro que quieres eliminar esta publicación?')) {
                              try {
                                await import('firebase/firestore').then(async ({ deleteDoc, doc: docFirestore }) => {
                                  try {
                                    await deleteDoc(docFirestore(db, 'publicaciones', pub.id));
                                    alert('Publicación eliminada correctamente.');
                                  } catch (err2) {
                                    console.error('Error interno de deleteDoc:', err2);
                                    alert('Error interno de deleteDoc: ' + (err2 && err2.message ? err2.message : err2));
                                  }
                                });
                                await fetchPublicaciones();
                              } catch (err) {
                                console.error('Error externo al intentar eliminar:', err);
                                alert('No se pudo eliminar la publicación. ' + (err && err.message ? err.message : err));
                              }
                            }
                          }}
                        >
                          Eliminar
                        </Button>
                      )}
                      <div style={{ borderTop: '1px solid #eee', marginTop: 12, paddingTop: 12 }}>
                        <ReaccionesPublicacion publicacionId={pub.id} user={user} />
                        <ComentariosPublicacion publicacionId={pub.id} user={user} />
                      </div>
                    </div>
                  ))}
                </div>
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
        <>
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
                  <div style={{ fontSize: 13, color: '#a78bfa' }}>Por: {pub.autorNombre}</div>
                  <div style={{ fontSize: 12, color: '#b5b5b5' }}>{pub.createdAt && pub.createdAt.toDate && pub.createdAt.toDate().toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default Publicaciones;
