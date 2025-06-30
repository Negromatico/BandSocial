import React from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';
import Select from 'react-select';

const dias = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

export default function HorariosField({ control, register, setValue, watch }) {
  const [horarios, setHorarios] = React.useState(watch('horarios') || []);

  React.useEffect(() => {
    setValue('horarios', horarios);
    // eslint-disable-next-line
  }, [horarios]);

  const handleAdd = () => {
    setHorarios([...horarios, { dia: null, hora: '' }]);
  };
  const handleRemove = idx => {
    setHorarios(horarios.filter((_, i) => i !== idx));
  };
  const handleDiaChange = (idx, option) => {
    const newHorarios = [...horarios];
    newHorarios[idx].dia = option;
    setHorarios(newHorarios);
  };
  const handleHoraChange = (idx, e) => {
    const newHorarios = [...horarios];
    newHorarios[idx].hora = e.target.value;
    setHorarios(newHorarios);
  };

  return (
    <div>
      {horarios.map((h, idx) => (
        <Row key={idx} className="mb-2 align-items-center">
          <Col md={5} style={{ minWidth: 180, maxWidth: 250 }}>
            <Select
              value={h.dia}
              onChange={opt => handleDiaChange(idx, opt)}
              options={dias}
              placeholder="Día"
              isClearable
              styles={{
                container: base => ({ ...base, minWidth: 180, maxWidth: 250 }),
                control: base => ({ ...base, minHeight: 44, fontSize: 16 })
              }}
            />
          </Col>
          <Col md={5} style={{ minWidth: 120, display: 'flex', alignItems: 'center', height: 48 }}>
            <Form.Control
              type="time"
              value={h.hora}
              onChange={e => handleHoraChange(idx, e)}
              placeholder="Hora"
              style={{ minHeight: 44, fontSize: 16, height: 44, alignItems: 'center' }}
            />
          </Col>
          <Col md={2} className="d-flex align-items-center" style={{ marginLeft: -20, marginBottom: 8 }}>
            <Button variant="danger" size="sm" onClick={() => handleRemove(idx)} style={{ marginLeft: 10, marginBottom: 8 }}>
              Quitar
            </Button>
          </Col>
        </Row>
      ))}
      <Button variant="primary" size="sm" onClick={handleAdd}>
        Añadir horario
      </Button>
    </div>
  );
}
