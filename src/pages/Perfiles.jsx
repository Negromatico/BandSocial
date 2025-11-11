import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import Select from 'react-select';


// Lista de géneros musicales centralizada (puedes moverla a opciones.js si quieres reutilizarla)
const generosMusicales = [
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'blues', label: 'Blues' },
  { value: 'reggae', label: 'Reggae' },
  { value: 'salsa', label: 'Salsa' },
  { value: 'cumbia', label: 'Cumbia' },
  { value: 'norteño', label: 'Norteño' },
  { value: 'banda', label: 'Banda' },
  { value: 'tropical', label: 'Tropical' },
  { value: 'otro', label: 'Otro (especificar)' },
];

export default function Perfiles() {
  const [perfiles, setPerfiles] = useState([]);
  const [ciudad, setCiudad] = useState(null);
  const [generos, setGeneros] = useState([]);
  const [otraCiudad, setOtraCiudad] = useState('');
  const [otroGenero, setOtroGenero] = useState('');
  const [ciudadesOptions, setCiudadesOptions] = React.useState([]);
  React.useEffect(() => {
    fetch('https://api-colombia.com/api/v1/City')
      .then(res => res.json())
      .then(data => {
        const options = data.map(city => ({ value: city.name.toLowerCase(), label: city.name })).sort((a, b) => a.label.localeCompare(b.label));
        setCiudadesOptions(options);
      })
      .catch(() => setCiudadesOptions([]));
  }, []);

  useEffect(() => {
    const fetchPerfiles = async () => {
      const q = query(collection(db, 'perfiles'));
      const snapshot = await getDocs(q);
      setPerfiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPerfiles();
  }, []);

  // Filtro reactivo
  const perfilesFiltrados = perfiles.filter(p => {
    let match = true;
    if (ciudad) {
      if (ciudad.value === 'otro') {
        match = match && p.ciudad?.toLowerCase() === otraCiudad.trim().toLowerCase();
      } else {
        match = match && p.ciudad === ciudad.value;
      }
    }
    if (generos.length > 0) {
      const generosFiltro = generos.map(g => g.value === 'otro' ? otroGenero.trim().toLowerCase() : g.value);
      match = match && generosFiltro.every(gf => p.generos?.map(gg => gg.toLowerCase()).includes(gf));
    }
    return match;
  });

  return (
    <div style={{ background: '#f8f6fc', minHeight: '100vh', padding: 24 }}>
      <h2 style={{ color: '#7c3aed', fontWeight: 700, marginBottom: 24 }}>Buscar músicos y bandas</h2>
      <div style={{ display: 'flex', gap: 24, marginBottom: 30 }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: '#7c3aed', fontWeight: 500 }}>Ciudad</label>
          <Select
            options={[...ciudadesOptions, { value: 'otro', label: 'Otro (especificar)' }]}
            value={ciudad}
            onChange={val => { setCiudad(val); if (val?.value !== 'otro') setOtraCiudad(''); }}
            isClearable
            placeholder="Selecciona o busca ciudad"
          />
          {ciudad?.value === 'otro' && (
            <input type="text" className="form-control mt-2" placeholder="Especifica ciudad" value={otraCiudad} onChange={e => setOtraCiudad(e.target.value)} />
          )}
        </div>
        <div style={{ flex: 2 }}>
          <label style={{ color: '#7c3aed', fontWeight: 500 }}>Géneros musicales</label>
          <Select
            options={generosMusicales}
            value={generos}
            onChange={vals => { setGeneros(vals || []); if (!vals?.some(v => v.value === 'otro')) setOtroGenero(''); }}
            isMulti
            isClearable
            placeholder="Selecciona uno o varios géneros"
          />
          {generos.some(g => g.value === 'otro') && (
            <input type="text" className="form-control mt-2" placeholder="Especifica género musical" value={otroGenero} onChange={e => setOtroGenero(e.target.value)} />
          )}
        </div>
      </div>
      <div>
        {perfilesFiltrados.length === 0 ? (
          <div className="alert alert-info">No se encontraron músicos o bandas con esos filtros.</div>
        ) : (
          <div className="row g-3">
            {perfilesFiltrados.map(p => (
              <div key={p.id} className="col-12 col-md-6 col-lg-4">
                <div className="card shadow-sm p-3 h-100" style={{ borderRadius: 14 }}>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <img src={p.fotoPerfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(p.nombre || p.email || 'Perfil')} alt="avatar" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', background: '#ede9fe' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: 18 }}>{p.nombre || p.email || 'Perfil'}</div>
                      <div style={{ color: '#6b7280', fontSize: 14 }}>{p.type === 'banda' ? 'Banda' : 'Músico'}</div>
                      <div style={{ color: '#a78bfa', fontSize: 13 }}>{p.ciudad}</div>
                    </div>
                  </div>
                  <div style={{ color: '#6366f1', fontWeight: 500, fontSize: 14, marginBottom: 5 }}>Géneros: {Array.isArray(p.generos) ? p.generos.join(', ') : ''}</div>
                  <div style={{ color: '#6366f1', fontWeight: 500, fontSize: 14 }}>Instrumentos: {Array.isArray(p.instrumentos) ? p.instrumentos.join(', ') : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
