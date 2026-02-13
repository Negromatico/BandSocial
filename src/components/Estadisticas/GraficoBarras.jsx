import React from 'react';
import { Card } from 'react-bootstrap';
import './GraficoBarras.css';

const GraficoBarras = ({ titulo, datos, maxValor = null, colorBarra = 'primary' }) => {
  const max = maxValor || Math.max(...datos.map(d => d.valor));
  
  return (
    <Card className="grafico-barras-card">
      <Card.Header>
        <h5 className="mb-0">{titulo}</h5>
      </Card.Header>
      <Card.Body>
        <div className="grafico-barras-container">
          {datos.map((item, index) => {
            const porcentaje = (item.valor / max) * 100;
            return (
              <div key={index} className="barra-item">
                <div className="barra-label">
                  <span className="barra-nombre">{item.nombre}</span>
                  <span className="barra-valor">{item.valor}</span>
                </div>
                <div className="barra-contenedor">
                  <div 
                    className={`barra-progreso bg-${colorBarra}`}
                    style={{ width: `${porcentaje}%` }}
                  >
                    <span className="barra-porcentaje">{porcentaje.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
};

export default GraficoBarras;
