# Actualización Ver Horarios - Agregar Columna Curso y Filtros

## Cambios Necesarios en index.html

### 1. Modificar función mostrarHorarios() - Línea 234

**BUSCAR:**
```javascript
let html = '<table><tr><th>Profesor</th><th>Materia</th><th>Dia</th><th>Horario</th><th>Turno</th><th>Cupo</th></tr>';
```

**REEMPLAZAR POR:**
```javascript
let html = '<table id="tablaHorarios"><tr><th onclick="ordenarTabla(\'profesor\')">Profesor ▼</th><th onclick="ordenarTabla(\'materia\')">Materia ▼</th><th onclick="ordenarTabla(\'curso\')">Curso ▼</th><th onclick="ordenarTabla(\'dia\')">Dia ▼</th><th onclick="ordenarTabla(\'horario\')">Horario ▼</th><th onclick="ordenarTabla(\'turno\')">Turno ▼</th><th onclick="ordenarTabla(\'cupo\')">Cupo ▼</th></tr>';
```

### 2. Modificar ciclo forEach - Línea 236

**BUSCAR:**
```javascript
profesores.forEach(p => {
  html += `<tr><td>${p.nombre}</td><td>${p.materia}</td><td>${p.dia}</td><td>${p.horario}</td><td>${p.turno}</td><td>${p.asignados}/${p.capacidad}</td></tr>`;
});
```

**REEMPLAZAR POR:**
```javascript
profesores.forEach(p => {
  const curso = p.año && p.curso ? `${p.año}° ${p.curso}` : 'N/A';
  html += `<tr><td>${p.nombre}</td><td>${p.materia}</td><td>${curso}</td><td>${p.dia}</td><td>${p.horario}</td><td>${p.turno}</td><td>${p.asignados}/${p.capacidad}</td></tr>`;
});
```

### 3. Agregar función ordenarTabla() ANTES de la función window.onload

**AGREGAR ESTE CÓDIGO:**
```javascript
let ordenActual = { columna: null, ascendente: true };

function ordenarTabla(columna) {
  const mapeoColumnas = {
    'profesor': 0,
    'materia': 1,
    'curso': 2,
    'dia': 3,
    'horario': 4,
    'turno': 5,
    'cupo': 6
  };
  
  const indice = mapeoColumnas[columna];
  
  // Cambiar dirección si es la misma columna
  if(ordenActual.columna === columna) {
    ordenActual.ascendente = !ordenActual.ascendente;
  } else {
    ordenActual.columna = columna;
    ordenActual.ascendente = true;
  }
  
  // Ordenar array profesores
  profesores.sort((a, b) => {
    let valorA, valorB;
    
    switch(columna) {
      case 'profesor':
        valorA = a.nombre.toLowerCase();
        valorB = b.nombre.toLowerCase();
        break;
      case 'materia':
        valorA = a.materia.toLowerCase();
        valorB = b.materia.toLowerCase();
        break;
      case 'curso':
        valorA = (a.año && a.curso) ? `${a.año}${a.curso}` : 'ZZZ';
        valorB = (b.año && b.curso) ? `${b.año}${b.curso}` : 'ZZZ';
        break;
      case 'dia':
        const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
        valorA = dias.indexOf(a.dia.toLowerCase());
        valorB = dias.indexOf(b.dia.toLowerCase());
        break;
      case 'horario':
        valorA = a.horario;
        valorB = b.horario;
        break;
      case 'turno':
        const turnos = ['mañana', 'tarde', 'vespertino', 'noche'];
        valorA = turnos.indexOf(a.turno.toLowerCase());
        valorB = turnos.indexOf(b.turno.toLowerCase());
        break;
      case 'cupo':
        valorA = a.asignados;
        valorB = b.asignados;
        break;
    }
    
    if(valorA < valorB) return ordenActual.ascendente ? -1 : 1;
    if(valorA > valorB) return ordenActual.ascendente ? 1 : -1;
    return 0;
  });
  
  // Actualizar vista
  mostrarHorarios();
}
```

### 4. Agregar estilos CSS para headers clickeables

**BUSCAR en la sección <style>:**
```css
th { background: #667eea; color: white; }
```

**REEMPLAZAR POR:**
```css
th { background: #667eea; color: white; cursor: pointer; user-select: none; }
th:hover { background: #5568d3; }
```

## Verificación de Datos

Los 30 profesores pre-cargados ya tienen los campos `año` y `curso`. Ejemplo:
- Rodriguez Maria: año '4', curso 'A'
- Perez Sofia: año '4', curso 'C'
- Silva Daniel: año '4', curso 'E'

Todos los datos de los 3 turnos (Mañana, Tarde, Vespertino) están completos con:
- Profesor ✓
- Materia ✓
- Curso (año + división) ✓
- Dia ✓
- Horario ✓
- Turno ✓
- Capacidad ✓

## Resultado Final

La tabla "Ver Horarios" mostrará:
1. Columna "Curso" con formato "4° A", "5° B", etc.
2. Cada columna será clickeable para ordenar
3. Click en la misma columna invierte el orden (ASC/DESC)
4. Indicador visual ▼ en cada header
5. Hover effect en los headers

## Para Aplicar los Cambios

1. Editar index.html
2. Aplicar cada reemplazo en el orden indicado
3. Commit y Push
4. GitHub Pages se actualizará automáticamente
5. Refrescar la página (Ctrl+F5) para ver cambios
