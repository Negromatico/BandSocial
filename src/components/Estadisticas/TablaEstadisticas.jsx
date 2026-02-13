import React, { useState } from 'react';
import { Card, Table, Form, InputGroup } from 'react-bootstrap';
import './TablaEstadisticas.css';

const TablaEstadisticas = ({ titulo, columnas, datos, busqueda = true }) => {
  const [filtro, setFiltro] = useState('');
  const [ordenamiento, setOrdenamiento] = useState({ columna: null, direccion: 'asc' });

  const datosFiltrados = datos.filter(item => {
    if (!filtro) return true;
    return Object.values(item).some(valor => 
      String(valor).toLowerCase().includes(filtro.toLowerCase())
    );
  });

  const datosOrdenados = [...datosFiltrados].sort((a, b) => {
    if (!ordenamiento.columna) return 0;
    
    const valorA = a[ordenamiento.columna];
    const valorB = b[ordenamiento.columna];
    
    if (typeof valorA === 'number' && typeof valorB === 'number') {
      return ordenamiento.direccion === 'asc' ? valorA - valorB : valorB - valorA;
    }
    
    return ordenamiento.direccion === 'asc' 
      ? String(valorA).localeCompare(String(valorB))
      : String(valorB).localeCompare(String(valorA));
  });

  const handleOrdenar = (columna) => {
    setOrdenamiento(prev => ({
      columna,
      direccion: prev.columna === columna && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <Card className="tabla-estadisticas-card">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{titulo}</h5>
          {busqueda && (
            <InputGroup style={{ maxWidth: '300px' }}>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </InputGroup>
          )}
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead>
              <tr>
                {columnas.map((col, index) => (
                  <th 
                    key={index}
                    onClick={() => col.ordenable !== false && handleOrdenar(col.campo)}
                    style={{ cursor: col.ordenable !== false ? 'pointer' : 'default' }}
                  >
                    {col.titulo}
                    {ordenamiento.columna === col.campo && (
                      <i className={`bi bi-arrow-${ordenamiento.direccion === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datosOrdenados.length > 0 ? (
                datosOrdenados.map((item, index) => (
                  <tr key={index}>
                    {columnas.map((col, colIndex) => (
                      <td key={colIndex}>
                        {col.render ? col.render(item[col.campo], item) : item[col.campo]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columnas.length} className="text-center text-muted py-4">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
      {datosOrdenados.length > 0 && (
        <Card.Footer className="text-muted small">
          Mostrando {datosOrdenados.length} de {datos.length} registros
        </Card.Footer>
      )}
    </Card>
  );
};

export default TablaEstadisticas;
