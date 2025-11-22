# 🎨 Guía de Modales y Formularios Modernos

## 📋 Descripción

Este proyecto incluye estilos modernos y consistentes para todos los modales y formularios. El diseño incluye:

- ✅ Header con gradiente púrpura
- ✅ Formularios con bordes redondeados
- ✅ Selectores personalizados de fecha y hora
- ✅ Checkboxes estilizados
- ✅ Botones con efectos hover
- ✅ Diseño responsive

---

## 🚀 Cómo Usar

### **Paso 1: Importar el CSS**

En cualquier componente donde uses un Modal:

```javascript
import '../styles/ModernModal.css';
```

### **Paso 2: Agregar la Clase al Modal**

```jsx
<Modal 
  show={showModal} 
  onHide={() => setShowModal(false)} 
  className="modern-modal"  // ← Agregar esta clase
>
  <Modal.Header closeButton>
    <Modal.Title>Título del Modal</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* Tu formulario aquí */}
  </Modal.Body>
</Modal>
```

---

## 📝 Ejemplo Completo

```jsx
import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import '../styles/ModernModal.css';

function MiComponente() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    fecha: '',
    hora: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos:', formData);
    setShowModal(false);
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        Abrir Modal
      </Button>

      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        className="modern-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Formulario Moderno</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Input de Texto */}
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa tu nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
              />
            </Form.Group>

            {/* Textarea */}
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe..."
              />
            </Form.Group>

            {/* Selector de Fecha Personalizado */}
            <Form.Group className="mb-3">
              <Form.Label>Fecha *</Form.Label>
              <div className="date-picker-container">
                <div className="date-picker">
                  <div className="date-column">
                    <label className="date-label">DÍA</label>
                    <select className="date-select" required>
                      {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                        <option key={d} value={d.toString().padStart(2, '0')}>
                          {d.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="date-separator">/</div>
                  
                  <div className="date-column">
                    <label className="date-label">MES</label>
                    <select className="date-select" required>
                      <option value="01">ENE</option>
                      <option value="02">FEB</option>
                      {/* ... más meses */}
                    </select>
                  </div>
                  
                  <div className="date-separator">/</div>
                  
                  <div className="date-column">
                    <label className="date-label">AÑO</label>
                    <select className="date-select" required>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>
                </div>
              </div>
            </Form.Group>

            {/* Selector de Hora Personalizado */}
            <Form.Group className="mb-3">
              <Form.Label>Hora *</Form.Label>
              <div className="time-picker-container">
                <div className="time-picker">
                  <div className="time-column">
                    <label className="time-label">HORA</label>
                    <select className="time-select" required>
                      {Array.from({length: 24}, (_, i) => i).map(h => (
                        <option key={h} value={h.toString().padStart(2, '0')}>
                          {h.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="time-separator">:</div>
                  
                  <div className="time-column">
                    <label className="time-label">MINUTOS</label>
                    <select className="time-select" required>
                      <option value="00">00</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="45">45</option>
                    </select>
                  </div>
                </div>
              </div>
            </Form.Group>

            {/* Checkboxes */}
            <Form.Group className="mb-3">
              <Form.Label>Opciones</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                <Form.Check
                  type="checkbox"
                  id="opcion1"
                  label="Opción 1"
                />
                <Form.Check
                  type="checkbox"
                  id="opcion2"
                  label="Opción 2"
                />
              </div>
            </Form.Group>

            {/* Botones */}
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Guardar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default MiComponente;
```

---

## 🎨 Componentes Disponibles

### **1. Inputs de Texto**
```jsx
<Form.Control
  type="text"
  placeholder="Texto aquí"
/>
```

### **2. Textareas**
```jsx
<Form.Control
  as="textarea"
  rows={3}
  placeholder="Descripción..."
/>
```

### **3. Selects Normales**
```jsx
<Form.Select>
  <option>Opción 1</option>
  <option>Opción 2</option>
</Form.Select>
```

### **4. Selector de Fecha Personalizado**
```jsx
<div className="date-picker-container">
  <div className="date-picker">
    {/* DÍA, MES, AÑO */}
  </div>
</div>
```

### **5. Selector de Hora Personalizado**
```jsx
<div className="time-picker-container">
  <div className="time-picker">
    {/* HORA, MINUTOS */}
  </div>
</div>
```

### **6. Checkboxes**
```jsx
<Form.Check
  type="checkbox"
  id="check1"
  label="Opción"
/>
```

### **7. Botones**
```jsx
<Button variant="secondary">Cancelar</Button>
<Button variant="primary">Confirmar</Button>
```

---

## 🎯 Archivos Modificados

### **Archivos Creados:**
- ✅ `src/styles/ModernModal.css` - Estilos globales reutilizables

### **Archivos que Usan los Estilos:**
- ✅ `src/pages/EventosNuevo.jsx` - Modal de crear evento

### **Cómo Aplicar a Otros Componentes:**

1. **PublicacionForm.jsx** - Modal de crear publicación
2. **MusicmarketNuevo.jsx** - Modal de crear producto
3. **Profile.jsx** - Modal de editar perfil
4. **Chat.jsx** - Modal de chat
5. **Cualquier otro modal del proyecto**

---

## 📱 Responsive

Los estilos son completamente responsive:

- **Desktop:** Selectores 70x70px
- **Tablet:** Selectores 60x60px
- **Móvil:** Selectores 60x60px con fuentes más pequeñas

---

## 🎨 Paleta de Colores

```css
Gradiente Primario: #667eea → #764ba2
Gris Secundario:    #6b7280
Bordes:             #e5e7eb
Fondo Body:         #f8f9fa
Texto:              #374151
Focus:              rgba(102, 126, 234, 0.1)
```

---

## ✅ Checklist de Implementación

Para aplicar estos estilos a un nuevo modal:

- [ ] Importar `../styles/ModernModal.css`
- [ ] Agregar `className="modern-modal"` al `<Modal>`
- [ ] Usar `<Modal.Header>` con `closeButton`
- [ ] Usar `<Modal.Body>` para el contenido
- [ ] Usar `<Form.Label>` para labels
- [ ] Usar `<Form.Control>` para inputs
- [ ] Usar `<Button variant="primary">` y `variant="secondary"`
- [ ] Probar en móvil y desktop

---

## 🚀 Próximos Pasos

1. Aplicar estos estilos a todos los modales existentes
2. Crear componentes reutilizables (DatePicker, TimePicker)
3. Agregar más variantes de colores
4. Documentar más ejemplos

---

## 📞 Soporte

Si tienes dudas sobre cómo implementar estos estilos, revisa:
- Este archivo de guía
- `src/styles/ModernModal.css` (comentarios en el código)
- `src/pages/EventosNuevo.jsx` (ejemplo completo)

---

**¡Disfruta de tus modales modernos! 🎸✨**
