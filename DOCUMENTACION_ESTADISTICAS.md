# Documentación del Sistema de Estadísticas - BandSocial

## Descripción General

Sistema completo de estadísticas para BandSocial que incluye:
- API de ubicaciones de Colombia (departamentos y municipios)
- Estadísticas por ubicación geográfica
- Estadísticas por instrumentos y géneros musicales
- Estadísticas de eventos, publicaciones, usuarios y productos
- Componentes de visualización interactivos

## Estructura de Archivos

### Servicios

#### `src/services/colombiaAPI.js`
Servicio para integrar la API de Colombia (https://api-colombia.com)

**Métodos principales:**
- `getDepartamentos()` - Obtiene todos los departamentos de Colombia
- `getDepartamentoById(id)` - Obtiene un departamento específico
- `getCiudadesByDepartamento(departamentoId)` - Obtiene ciudades de un departamento
- `getAllCiudades()` - Obtiene todas las ciudades
- `getCiudadById(id)` - Obtiene una ciudad específica
- `searchCiudades(nombre)` - Busca ciudades por nombre

#### `src/services/estadisticasService.js`
Servicio principal de estadísticas que consulta Firebase/Firestore

**Métodos principales:**
- `getEstadisticasPorDepartamento(departamentoId)` - Estadísticas por departamento
- `getEstadisticasPorMunicipio(municipioId)` - Estadísticas por municipio
- `getEstadisticasPorInstrumento()` - Estadísticas de instrumentos
- `getEstadisticasPorGeneroMusical()` - Estadísticas de géneros musicales
- `getEstadisticasEventos(filtros)` - Estadísticas de eventos
- `getEstadisticasPublicaciones(filtros)` - Estadísticas de publicaciones
- `getEstadisticasUsuarios()` - Estadísticas de usuarios
- `getEstadisticasProductos(filtros)` - Estadísticas de productos
- `getEstadisticasGenerales()` - Estadísticas generales consolidadas

### Hooks Personalizados

#### `src/hooks/useColombia.js`
Hooks para trabajar con la API de Colombia

**Hooks disponibles:**
- `useDepartamentos()` - Carga todos los departamentos
- `useCiudades(departamentoId)` - Carga ciudades de un departamento
- `useBuscarCiudad()` - Búsqueda de ciudades
- `useDepartamento(departamentoId)` - Carga un departamento específico
- `useCiudad(ciudadId)` - Carga una ciudad específica

**Ejemplo de uso:**
```javascript
import { useDepartamentos, useCiudades } from '../hooks/useColombia';

function MiComponente() {
  const { departamentos, loading, error } = useDepartamentos();
  const { ciudades } = useCiudades(departamentoSeleccionado);
  
  return (
    // Tu JSX aquí
  );
}
```

#### `src/hooks/useEstadisticas.js`
Hooks para trabajar con estadísticas

**Hooks disponibles:**
- `useEstadisticas(tipo, filtros)` - Hook genérico
- `useEstadisticasDepartamento(departamentoId)`
- `useEstadisticasMunicipio(municipioId)`
- `useEstadisticasInstrumentos()`
- `useEstadisticasGeneros()`
- `useEstadisticasEventos(filtros)`
- `useEstadisticasPublicaciones(filtros)`
- `useEstadisticasUsuarios()`
- `useEstadisticasProductos(filtros)`

**Ejemplo de uso:**
```javascript
import { useEstadisticasInstrumentos } from '../hooks/useEstadisticas';

function MiComponente() {
  const { datos, loading, error, refrescar } = useEstadisticasInstrumentos();
  
  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;
  
  return (
    <div>
      <h3>Total instrumentos: {datos.totalInstrumentos}</h3>
      <button onClick={refrescar}>Refrescar</button>
    </div>
  );
}
```

### Componentes de Visualización

#### `src/components/Estadisticas/EstadisticasCard.jsx`
Tarjeta para mostrar una métrica individual

**Props:**
- `titulo` (string) - Título de la métrica
- `valor` (string|number) - Valor a mostrar
- `icono` (ReactNode) - Ícono opcional
- `color` (string) - Color del tema (primary, success, danger, etc.)
- `descripcion` (string) - Descripción opcional
- `tendencia` (object) - Objeto con tipo ('up'|'down') y valor

**Ejemplo:**
```jsx
<EstadisticasCard
  titulo="Total Usuarios"
  valor={1250}
  icono={<i className="bi bi-people-fill"></i>}
  color="primary"
  descripcion="Usuarios registrados"
  tendencia={{ tipo: 'up', valor: '+12%' }}
/>
```

#### `src/components/Estadisticas/GraficoBarras.jsx`
Gráfico de barras horizontal

**Props:**
- `titulo` (string) - Título del gráfico
- `datos` (array) - Array de objetos con { nombre, valor }
- `maxValor` (number) - Valor máximo opcional
- `colorBarra` (string) - Color de las barras

**Ejemplo:**
```jsx
<GraficoBarras
  titulo="Instrumentos Más Populares"
  datos={[
    { nombre: 'Guitarra', valor: 450 },
    { nombre: 'Bajo', valor: 320 },
    { nombre: 'Batería', valor: 280 }
  ]}
  colorBarra="primary"
/>
```

#### `src/components/Estadisticas/TablaEstadisticas.jsx`
Tabla con búsqueda y ordenamiento

**Props:**
- `titulo` (string) - Título de la tabla
- `columnas` (array) - Array de objetos con { titulo, campo, ordenable, render }
- `datos` (array) - Array de objetos con los datos
- `busqueda` (boolean) - Habilitar búsqueda (default: true)

**Ejemplo:**
```jsx
<TablaEstadisticas
  titulo="Top Usuarios"
  columnas={[
    { titulo: 'Nombre', campo: 'nombre' },
    { titulo: 'Publicaciones', campo: 'publicaciones' },
    { 
      titulo: 'Estado', 
      campo: 'activo',
      render: (valor) => valor ? '✓ Activo' : '✗ Inactivo'
    }
  ]}
  datos={usuarios}
/>
```

### Integración en Panel de Administrador

#### `src/pages/AdminDashboard.jsx`
Las estadísticas están completamente integradas en el Panel de Administrador como una pestaña adicional con sub-pestañas:

1. **General** - Resumen general de la plataforma
2. **Por Ubicación** - Estadísticas por departamento y municipio
3. **Instrumentos** - Estadísticas de instrumentos
4. **Géneros Musicales** - Estadísticas de géneros
5. **Eventos** - Estadísticas de eventos y asistentes
6. **Productos** - Estadísticas de productos y ventas

**Acceso:** Solo disponible para administradores (estebanber24@gmail.com)

### Datos

#### `src/data/opciones.js`
Actualizado con nuevas opciones:

**Nuevas exportaciones:**
- `generosMusicales` - 46 géneros musicales incluyendo colombianos
- `estadosProducto` - Estados de productos (nuevo, usado, etc.)
- `tiposPublicacion` - Tipos de publicaciones

## Estructura de Datos en Firebase

### Colección: usuarios
```javascript
{
  uid: string,
  nombre: string,
  departamento: string,  // ID del departamento
  municipio: string,     // ID del municipio
  instrumentos: array,   // ['guitarra', 'bajo']
  generosMusicales: array, // ['rock', 'jazz']
  premium: boolean,
  tipoCuenta: string,    // 'musico', 'banda', 'productor'
  ultimaActividad: timestamp
}
```

### Colección: eventos
```javascript
{
  nombre: string,
  ciudad: string,
  departamento: string,
  fecha: timestamp,
  asistentes: array,     // Array de UIDs
  reacciones: object     // { uid: tipo }
}
```

### Colección: publicaciones
```javascript
{
  tipo: string,          // 'general', 'evento', 'busqueda', etc.
  autorId: string,
  reacciones: object,    // { uid: tipo }
  comentarios: array
}
```

### Colección: productos
```javascript
{
  nombre: string,
  estado: string,        // 'nuevo', 'usado', etc.
  ubicacion: string,
  ciudad: string,
  categoria: string,
  precio: number,
  valoracion: number
}
```

## Rutas

- `/admin` - Panel de Administrador (incluye pestaña de Estadísticas)
  - Solo accesible para administradores autenticados
  - Requiere email: estebanber24@gmail.com

## Instalación y Configuración

### 1. Dependencias
Ya están instaladas en el proyecto:
- axios (para API de Colombia)
- firebase (para estadísticas)
- react-bootstrap (para UI)
- bootstrap-icons (para íconos)

### 2. Configuración de Firebase
El proyecto ya tiene Firebase configurado en `src/services/firebase.js`

### 3. Acceso desde el Panel de Administrador
Las estadísticas están integradas en el Panel de Administrador:
1. Navegar a `/admin`
2. Hacer clic en la pestaña "📊 Estadísticas"
3. Explorar las 6 sub-pestañas disponibles

**Nota:** Solo usuarios administradores pueden acceder a esta funcionalidad.

## Ejemplos de Uso

### Ejemplo 1: Mostrar estadísticas de un departamento
```javascript
import { useEstadisticasDepartamento } from '../hooks/useEstadisticas';
import EstadisticasCard from '../components/Estadisticas/EstadisticasCard';

function EstadisticasDepartamento({ departamentoId }) {
  const { datos, loading, error } = useEstadisticasDepartamento(departamentoId);
  
  if (loading) return <Spinner />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  
  return (
    <Row>
      <Col md={4}>
        <EstadisticasCard
          titulo="Total Usuarios"
          valor={datos.totalUsuarios}
          icono={<i className="bi bi-people"></i>}
          color="primary"
        />
      </Col>
    </Row>
  );
}
```

### Ejemplo 2: Selector de departamentos y ciudades
```javascript
import { useDepartamentos, useCiudades } from '../hooks/useColombia';

function SelectorUbicacion() {
  const [deptId, setDeptId] = useState('');
  const { departamentos } = useDepartamentos();
  const { ciudades } = useCiudades(deptId);
  
  return (
    <>
      <Form.Select onChange={(e) => setDeptId(e.target.value)}>
        <option value="">Seleccionar departamento</option>
        {departamentos.map(d => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </Form.Select>
      
      <Form.Select disabled={!deptId}>
        <option value="">Seleccionar ciudad</option>
        {ciudades.map(c => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </Form.Select>
    </>
  );
}
```

### Ejemplo 3: Gráfico personalizado
```javascript
import GraficoBarras from '../components/Estadisticas/GraficoBarras';
import { useEstadisticasInstrumentos } from '../hooks/useEstadisticas';

function GraficoInstrumentos() {
  const { datos } = useEstadisticasInstrumentos();
  
  const datosGrafico = Object.entries(datos?.instrumentos || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([nombre, valor]) => ({ nombre, valor }));
  
  return (
    <GraficoBarras
      titulo="Top 10 Instrumentos"
      datos={datosGrafico}
      colorBarra="success"
    />
  );
}
```

## Funcionalidades Implementadas

### ✅ Completadas

1. **API de Colombia**
   - Integración con https://api-colombia.com
   - Obtención de departamentos
   - Obtención de municipios/ciudades
   - Búsqueda de ubicaciones

2. **Estadísticas por Ubicación**
   - Estadísticas por departamento
   - Estadísticas por municipio
   - Usuarios por ubicación
   - Eventos por ciudad

3. **Estadísticas por Instrumentos**
   - Total de instrumentos
   - Instrumentos más populares
   - Usuarios por instrumento
   - Distribución geográfica

4. **Estadísticas por Género Musical**
   - Total de géneros
   - Géneros más populares
   - Usuarios por género
   - Distribución geográfica

5. **Estadísticas de Eventos**
   - Total de eventos
   - Eventos por ciudad
   - Asistentes por evento
   - Reacciones por evento
   - Eventos por fecha

6. **Estadísticas de Publicaciones**
   - Total de publicaciones
   - Publicaciones por tipo
   - Reacciones por publicación
   - Comentarios por publicación
   - Publicaciones por usuario

7. **Estadísticas de Usuarios**
   - Total de usuarios
   - Usuarios premium vs gratis
   - Usuarios por tipo de cuenta
   - Usuarios activos/inactivos
   - Distribución geográfica

8. **Estadísticas de Productos**
   - Total de productos
   - Productos por estado
   - Productos por ubicación
   - Valoración promedio
   - Análisis de precios
   - Productos por rango de precio

9. **Componentes de Visualización**
   - Tarjetas de estadísticas
   - Gráficos de barras
   - Tablas con búsqueda y ordenamiento

10. **Hooks Personalizados**
    - Hooks para estadísticas
    - Hooks para API de Colombia
    - Manejo de estados de carga y errores

## Notas Técnicas

- Todas las consultas a Firebase son asíncronas
- Los hooks manejan automáticamente estados de carga y errores
- Los componentes son responsivos y funcionan en móviles
- Las estadísticas se calculan en tiempo real desde Firestore
- La API de Colombia es externa y no requiere autenticación

## Próximas Mejoras Sugeridas

1. Caché de datos para mejorar rendimiento
2. Exportación de estadísticas a PDF/Excel
3. Gráficos más avanzados (líneas, tortas, etc.)
4. Filtros por rango de fechas
5. Comparativas entre períodos
6. Estadísticas en tiempo real con WebSockets
7. Panel de administrador con más controles

## Soporte

Para más información o problemas, contactar al equipo de desarrollo de BandSocial.
