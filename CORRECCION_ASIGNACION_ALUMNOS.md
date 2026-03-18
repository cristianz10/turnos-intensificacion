# Corrección Sistema de Asignación de Alumnos

## Errores Detectados

### 1. Falta el AÑO y CURSO del alumno
**Problema:** El sistema no pregunta a qué año y curso pertenece el alumno (4°A, 5°B, etc.)

**Consecuencia:** No puede asignar al profesor correcto porque cada materia la dictan diferentes profesores según el año y curso.

**Ejemplo:** 
- "Lengua" puede ser:
  - Lengua 4°A (Gonzalez Juan - Lunes 7:30-9:00)
  - Lengua 5°A (Gonzalez Juan - Martes 7:30-9:00)
  - Lengua 4°C (Diaz Roberto - Miércoles 14:30-16:00)
  - etc.

### 2. Error "No hay cupo disponible" en primer alumno
**Problema:** Si es el primer alumno que se carga, DEBE haber cupo disponible.

**Causa:** El sistema busca profesores con `asignados < capacidad`, pero los datos pre-cargados NO tienen el campo `asignados` inicializado en 0.

---

## Solución

### Cambio 1: Agregar campo "Curso del Alumno" en formulario

**BUSCAR en index.html (línea ~94):**
```html
<label>Materias Previas (separadas por comas, max 4)</label>
<input type="text" id="previas" placeholder="Ej: Matematica,Lengua,Historia" required>
```

**AGREGAR ANTES:**
```html
<div class="form-group">
    <label>Año del Alumno</label>
    <select id="anioAlumno" required>
        <option value="">Seleccionar...</option>
        <option value="4">4to Año</option>
        <option value="5">5to Año</option>
    </select>
</div>

<div class="form-group">
    <label>Curso/División del Alumno</label>
    <select id="cursoAlumno" required>
        <option value="">Seleccionar...</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="E">E</option>
        <option value="F">F</option>
    </select>
</div>

<div class="form-group">
```

---

### Cambio 2: Modificar función asignarAlumno() para buscar por año y curso

**BUSCAR (línea ~175):**
```javascript
async function asignarAlumno() {
    const dni = document.getElementById('dniA').value;
    const nombre = document.getElementById('nombreA').value;
    const previasInput = document.getElementById('previas').value;
```

**REEMPLAZAR POR:**
```javascript
async function asignarAlumno() {
    const dni = document.getElementById('dniA').value;
    const nombre = document.getElementById('nombreA').value;
    const anioAlumno = document.getElementById('anioAlumno').value;
    const cursoAlumno = document.getElementById('cursoAlumno').value;
    const previasInput = document.getElementById('previas').value;

    if(!dni || !nombre || !anioAlumno || !cursoAlumno || !previasInput) {
        alert('Por favor completa todos los campos');
        return;
    }
```

---

### Cambio 3: Filtrar profesores por año y curso del alumno

**BUSCAR (línea ~191):**
```javascript
for(let previa of previas) {
    // Buscar profes que dicten esa materia
    let disponibles = profesores.filter(p => 
        p.materia.toLowerCase().includes(previa.toLowerCase()) && 
        p.asignados < p.capacidad
    );
```

**REEMPLAZAR POR:**
```javascript
for(let previa of previas) {
    // Buscar profes que dicten esa materia para el AÑO y CURSO específico del alumno
    let disponibles = profesores.filter(p => 
        p.materia.toLowerCase().includes(previa.toLowerCase()) && 
        p.año === anioAlumno &&
        p.curso === cursoAlumno &&
        (p.asignados || 0) < p.capacidad  // Usar 0 si asignados es undefined
    );
```

---

### Cambio 4: Inicializar contador `asignados` en datos pre-cargados

**BUSCAR (línea ~245):**
```javascript
const datosPrecargados = [
    // TURNO MAÑANA
    {nombre: 'Rodriguez Maria', materia: 'Matematica', año: '4', curso: 'A', turno: 'Mañana', dia: 'Lunes', horario: '7:30-9:00', capacidad: 15},
```

**REEMPLAZAR POR:**
```javascript
const datosPrecargados = [
    // TURNO MAÑANA
    {nombre: 'Rodriguez Maria', materia: 'Matematica', año: '4', curso: 'A', turno: 'Mañana', dia: 'Lunes', horario: '7:30-9:00', capacidad: 15, asignados: 0},
```

**IMPORTANTE:** Agregar `, asignados: 0` al final de CADA uno de los 30 profesores pre-cargados.

---

### Cambio 5: Mejorar mensaje de resultado para mostrar año y curso

**BUSCAR (línea ~218):**
```javascript
resultados.push(`${previa}: ✅ ${elegido.nombre} - ${elegido.dia} ${elegido.horario} (${elegido.turno})`);
```

**REEMPLAZAR POR:**
```javascript
resultados.push(`${previa} ${elegido.año}°${elegido.curso}: ✅ ${elegido.nombre} - ${elegido.dia} ${elegido.horario} (${elegido.turno})`);
```

---

## Resultado Esperado

### Antes:
```
Lengua: ❌ No hay cupo disponible
```

### Después:
```
Asignación completada para jose (4°A)

Lengua 4°A: ✅ Gonzalez Juan - Lunes 7:30-9:00 (Mañana)
```

---

## Resumen de Cambios

1. ✅ Agregar selectores de Año y Curso en formulario "Asignar Alumno"
2. ✅ Capturar año y curso del alumno en función `asignarAlumno()`
3. ✅ Filtrar profesores por materia + año + curso del alumno
4. ✅ Inicializar `asignados: 0` en todos los profesores pre-cargados
5. ✅ Mostrar "Lengua 4°A" en lugar de solo "Lengua"
6. ✅ Usar `(p.asignados || 0)` para manejar valores undefined

---

## Para Aplicar

1. Editar `index.html` en GitHub
2. Aplicar los 5 cambios en orden
3. Commit y Push
4. Limpiar cache del navegador (Ctrl+Shift+Delete)
5. Refrescar la página (Ctrl+F5)
6. Probar con un alumno de 4°A con previa "Lengua"
