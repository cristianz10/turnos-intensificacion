# GUIA: ABM y Exportar a Excel

## MODIFICACIONES REALIZADAS

Se agregaron las siguientes funcionalidades al sistema:

### 1. ABM de Profesores
- ✏️ **Editar**: Permite modificar cualquier dato de un profesor
- 🗑️ **Eliminar**: Borra un profesor del sistema
- Botones de acción en cada fila de la tabla

### 2. ABM de Alumnos
- 👁️ **Ver**: Nueva pestaña "Gestionar Alumnos" muestra todos los alumnos asignados
- 🗑️ **Eliminar**: Permite eliminar asignaciones de alumnos

### 3. Exportar a Excel
- 📥 **Botón Exportar**: Genera un archivo Excel con todos los datos
- **2 Hojas**: Una hoja para profesores, otra para alumnos
- **Formato CSV**: Compatible con Excel, Calc y Google Sheets

---

## CAMBIOS EN EL CODIGO

### Agregar en HTML (despues de linea 59 - tabs):

```html
<button class="tab" onclick="cambiarTab(3)">Gestionar Alumnos</button>
```

### Agregar en HTML (despues de tab2 - linea 147):

```html
<div id="tab3" class="content">
  <div class="alert alert-info">
    <strong>Gestionar Alumnos:</strong> Ver y eliminar asignaciones de alumnos.
  </div>
  <div id="listaAlumnos">No hay alumnos asignados aun.</div>
</div>
```

### Agregar BOTON EXPORTAR en tab2 (despues linea 144):

```html
<button class="btn" style="margin-top:20px; background:#28a745;" onclick="exportarExcel()">📥 Exportar Todo a Excel</button>
```

### Modificar function mostrarHorarios() - linea 227:

Reemplazar desde linea 233 hasta 238 con:

```javascript
let html = '<button class="btn" style="background:#28a745; margin-bottom:15px;" onclick="exportarExcel()">📥 Exportar a Excel</button>';
html += '<table><tr><th>Profesor</th><th>Materia</th><th>Dia</th><th>Horario</th><th>Turno</th><th>Cupo</th><th>Acciones</th></tr>';
profesores.forEach((p, index) => {
  html += `<tr>
    <td>${p.nombre}</td>
    <td>${p.materia}</td>
    <td>${p.dia}</td>
    <td>${p.horario}</td>
    <td>${p.turno}</td>
    <td>${p.asignados || 0}/${p.capacidad}</td>
    <td>
      <button onclick="editarProf(${index})" style="padding:5px 10px; background:#ffc107; border:none; border-radius:3px; cursor:pointer; margin-right:5px;">✏️ Editar</button>
      <button onclick="eliminarProf(${index})" style="padding:5px 10px; background:#dc3545; color:white; border:none; border-radius:3px; cursor:pointer;">🗑️ Eliminar</button>
    </td>
  </tr>`;
});
html += '</table>';
document.getElementById('listaHorarios').innerHTML = html;
```

### AGREGAR NUEVAS FUNCIONES AL FINAL DEL SCRIPT (antes de </script> - linea 290):

```javascript
// EDITAR PROFESOR
function editarProf(index) {
  const p = profesores[index];
  document.getElementById('nombre').value = p.nombre;
  document.getElementById('materia').value = p.materia;
  document.getElementById('turno').value = p.turno;
  document.getElementById('dia').value = p.dia;
  document.getElementById('horario').value = p.horario;
  document.getElementById('capacidad').value = p.capacidad;
  
  // Eliminar el viejo y guardar el editado
  profesores.splice(index, 1);
  localStorage.setItem('profesores', JSON.stringify(profesores));
  
  cambiarTab(0);
  alert('Editando profesor. Modifica los datos y presiona Guardar.');
}

// ELIMINAR PROFESOR
function eliminarProf(index) {
  if(confirm('¿Seguro que quieres eliminar este profesor?')) {
    profesores.splice(index, 1);
    localStorage.setItem('profesores', JSON.stringify(profesores));
    mostrarHorarios();
    alert('Profesor eliminado exitosamente');
  }
}

// MOSTRAR ALUMNOS
function mostrarAlumnos() {
  if(asignaciones.length === 0) {
    document.getElementById('listaAlumnos').innerHTML = 'No hay alumnos asignados aun.';
    return;
  }
  
  let html = '<table><tr><th>DNI</th><th>Nombre</th><th>Materia</th><th>Profesor</th><th>Dia</th><th>Horario</th><th>Acciones</th></tr>';
  asignaciones.forEach((a, index) => {
    html += `<tr>
      <td>${a.dni}</td>
      <td>${a.nombre}</td>
      <td>${a.materia}</td>
      <td>${a.profesor}</td>
      <td>${a.dia}</td>
      <td>${a.horario}</td>
      <td>
        <button onclick="eliminarAlumno(${index})" style="padding:5px 10px; background:#dc3545; color:white; border:none; border-radius:3px; cursor:pointer;">🗑️ Eliminar</button>
      </td>
    </tr>`;
  });
  html += '</table>';
  document.getElementById('listaAlumnos').innerHTML = html;
}

// ELIMINAR ALUMNO
function eliminarAlumno(index) {
  if(confirm('¿Seguro que quieres eliminar esta asignacion?')) {
    asignaciones.splice(index, 1);
    localStorage.setItem('asignaciones', JSON.stringify(asignaciones));
    mostrarAlumnos();
    alert('Asignacion eliminada exitosamente');
  }
}

// EXPORTAR A EXCEL (CSV)
function exportarExcel() {
  // HOJA 1: PROFESORES
  let csvProf = 'PROFESORES\n';
  csvProf += 'Nombre,Materia,Turno,Dia,Horario,Capacidad,Asignados\n';
  profesores.forEach(p => {
    csvProf += `${p.nombre},${p.materia},${p.turno},${p.dia},${p.horario},${p.capacidad},${p.asignados || 0}\n`;
  });
  
  // HOJA 2: ALUMNOS
  let csvAlum = '\n\nALUMNOS ASIGNADOS\n';
  csvAlum += 'DNI,Nombre,Materia,Profesor,Turno,Dia,Horario\n';
  asignaciones.forEach(a => {
    csvAlum += `${a.dni},${a.nombre},${a.materia},${a.profesor},${a.turno},${a.dia},${a.horario}\n`;
  });
  
  // CREAR Y DESCARGAR
  const csvCompleto = csvProf + csvAlum;
  const blob = new Blob([csvCompleto], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'turnos_intensificacion.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert('Archivo exportado exitosamente! Abrir con Excel.');
}
```

### MODIFICAR function cambiarTab() - linea 171:

Reemplazar con:

```javascript
function cambiarTab(index) {
  document.querySelectorAll('.tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.content').forEach((content, i) => {
    content.classList.toggle('active', i === index);
  });
  if(index === 2) mostrarHorarios();
  if(index === 3) mostrarAlumnos();
}
```

---

## INSTRUCCIONES PARA APLICAR

1. Abrir index.html en modo edicion
2. Aplicar los cambios descritos arriba
3. Guardar y hacer commit
4. Esperar 1-2 minutos a que GitHub Pages actualice
5. Abrir la pagina en ventana de incognito o borrar localStorage

## COMO USAR LAS NUEVAS FUNCIONES

### Editar un Profesor:
1. Ir a "Ver Horarios"
2. Click en "✏️ Editar" del profesor
3. Se abre "Cargar Profesores" con los datos
4. Modificar y presionar "Guardar"

### Eliminar un Profesor:
1. Ir a "Ver Horarios"
2. Click en "🗑️ Eliminar"
3. Confirmar

### Ver/Eliminar Alumnos:
1. Ir a "Gestionar Alumnos"
2. Ver lista completa de asignaciones
3. Click en "🗑️ Eliminar" para borrar

### Exportar a Excel:
1. Click en "📥 Exportar a Excel" (disponible en Ver Horarios)
2. Se descarga archivo CSV
3. Abrir con Excel/Calc/Google Sheets

