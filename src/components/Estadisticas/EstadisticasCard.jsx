import React from 'react';
import { Card } from 'react-bootstrap';
import './EstadisticasCard.css';

const EstadisticasCard = ({ titulo, valor, icono, color = 'primary', descripcion, tendencia }) => {
  return (
    <Card className={`estadistica-card border-${color}`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted mb-1 small">{titulo}</p>
            <h3 className={`mb-0 text-${color}`}>{valor}</h3>
            {descripcion && <p className="text-muted small mt-1 mb-0">{descripcion}</p>}
          </div>
          {icono && (
            <div className={`estadistica-icono bg-${color} bg-opacity-10 text-${color}`}>
              {icono}
            </div>
          )}
        </div>
        {tendencia && (
          <div className={`mt-2 small ${tendencia.tipo === 'up' ? 'text-success' : 'text-danger'}`}>
            <i className={`bi bi-arrow-${tendencia.tipo}`}></i> {tendencia.valor}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default EstadisticasCard;
