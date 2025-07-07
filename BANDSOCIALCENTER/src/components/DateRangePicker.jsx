import React from 'react';
import { Form } from 'react-bootstrap';

/**
 * Componente de calendario para seleccionar una fecha única o un rango de fechas.
 * @param {Object} props
 * @param {string} valueStart Fecha inicio (YYYY-MM-DD)
 * @param {string} valueEnd Fecha fin (YYYY-MM-DD)
 * @param {function} onChangeStart Cambia fecha inicio
 * @param {function} onChangeEnd Cambia fecha fin
 * @param {boolean} rango Si true, permite seleccionar un rango. Si false, solo una fecha.
 */
export default function DateRangePicker({ valueStart, valueEnd, onChangeStart, onChangeEnd, rango = false }) {
  return (
    <div className="d-flex gap-2 align-items-center">
      <Form.Control
        type="date"
        value={valueStart}
        min={new Date().toISOString().slice(0, 10)}
        onChange={e => onChangeStart(e.target.value)}
        required
        style={{ maxWidth: 180 }}
      />
      {rango && (
        <>
          <span style={{ fontWeight: 600, color: '#7c3aed' }}>a</span>
          <Form.Control
            type="date"
            value={valueEnd}
            min={new Date().toISOString().slice(0, 10)}
            onChange={e => onChangeEnd(e.target.value)}
            required
            style={{ maxWidth: 180 }}
          />
        </>
      )}
    </div>
  );
}
