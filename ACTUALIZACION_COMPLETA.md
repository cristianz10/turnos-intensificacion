# ACTUALIZACION COMPLETA DEL SISTEMA

## Cambios realizados:

### 1. AGREGAR CAMPOS AÑO Y CURSO

En la sección de "Cargar Profesores" (línea ~70), después del campo "Materia", agregar:

```html
<div class="form-group">
    <label>Año</label>
    <select id="anio" required>
        <option value="">Seleccionar...</option>
        <option value="1">1° Año</option>
        <option value="2">2° Año</option>
        <option value="3">3° Año</option>
        <option value="4">4° Año</option>
        <option value="5">5° Año</option>
        <option value="6">6° Año</option>
    </select>
</div>
<div class="form-group">
    <label>Curso</label>
    <input type="text" id="curso" placeholder="Ej: A, B, C" required>
</div>
```

### 2. AGREGAR LIBRERIA SHEETJS

Antes del `</head>` (línea ~38), agregar:

```html
<!-- Librería para leer/escribir Excel -->
<script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
```

### 3. AGREGAR ESTILOS PARA BOTONES

Dentro de `<style>` (línea ~35), agregar:

```css
.btn-success { background: #28a745; }
.btn-success:hover { background: #218838; }
.btn-group { display: flex; gap: 10px; margin-top: 20px; }
input[type="file"] { display: none; }
.file-label {
    display: inline-block;
    background: #28a745;
    color: white;
    padding: 12px 30px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.3s;
}
.file-label:hover { background: #218838; transform: translateY(-2px); }
```

### 4. AGREGAR BOTONES DE IMPORTAR/EXPORTAR

En pestaña "Cargar Profesores", después del botón "Guardar Profesor" (línea ~105):

```html
<div class="btn-group">
    <label for="fileProf" class="file-label">📁 Importar Excel</label>
    <input type="file" id="fileProf" accept=".xlsx,.xls,.csv" onchange="importarProfesores(event)">
    <button type="button" class="btn btn-success" onclick="exportarProfesores()">📊 Exportar Profesores</button>
</div>
```

En pestaña "Ver Horarios", después del texto de horarios cargados (línea ~140):

```html
<div class="btn-group">
    <button class="btn btn-success" onclick="exportarProfesores()">📊 Exportar Profesores</button>
    <button class="btn" onclick="exportarAsignaciones()">📥 Exportar Asignaciones</button>
</div>
```

### 5. ACTUALIZAR FUNCIÓN guardarProf()

Reemplazar la función `guardarProf()` completa (línea ~160) con:

```javascript
async function guardarProf() {
    const nombre = document.getElementById('nombre').value;
    const materia = document.getElementById('materia').value;
    const anio = document.getElementById('anio').value;
    const curso = document.getElementById('curso').value;
    const turno = document.getElementById('turno').value;
    const dia = document.getElementById('dia').value;
    const horario = document.getElementById('horario').value;
    const capacidad = parseInt(document.getElementById('capacidad').value);

    if(!nombre || !materia || !anio || !curso || !turno || !dia || !horario) {
        alert('Por favor completa todos los campos');
        return;
    }

    const prof = { nombre, materia, anio, curso, turno, dia, horario, capacidad, asignados: 0 };
    profesores.push(prof);
    
    localStorage.setItem('profesores', JSON.stringify(profesores));
    
    alert('Profesor guardado exitosamente!');
    document.getElementById('formProf').reset();
}
```

### 6. AGREGAR FUNCIONES DE IMPORTAR/EXPORTAR

Antes de `</script>` (línea ~245), agregar:

```javascript

// ===== FUNCIONES IMPORTAR/EXPORTAR =====

function importarProfesores(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet);
            
            let count = 0;
            rows.forEach(row => {
                if (row.Nombre && row.Materia && row.Anio && row.Curso && row.Turno && row.Dia && row.Horario && row.Capacidad) {
                    const prof = {
                        nombre: row.Nombre,
                        materia: row.Materia,
                        anio: row.Anio.toString(),
                        curso: row.Curso,
                        turno: row.Turno,
                        dia: row.Dia,
                        horario: row.Horario,
                        capacidad: parseInt(row.Capacidad),
                        asignados: 0
                    };
                    profesores.push(prof);
                    count++;
                }
            });
            
            localStorage.setItem('profesores', JSON.stringify(profesores));
            alert(`✅ Se importaron ${count} profesores exitosamente!`);
            document.getElementById('fileProf').value = '';
        } catch(error) {
            alert('❌ Error al leer el archivo: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function exportarProfesores() {
    if (profesores.length === 0) {
        alert('No hay profesores para exportar');
        return;
    }
    
    const data = profesores.map(p => ({
        Nombre: p.nombre,
        Materia: p.materia,
        Anio: p.anio,
        Curso: p.curso,
        Turno: p.turno,
        Dia: p.dia,
        Horario: p.horario,
        Capacidad: p.capacidad,
        Asignados: p.asignados
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Profesores');
    XLSX.writeFile(wb, 'profesores-intensificacion.xlsx');
}

function exportarAsignaciones() {
    if (asignaciones.length === 0) {
        alert('No hay asignaciones para exportar');
        return;
    }
    
    const ws = XLSX.utils.json_to_sheet(asignaciones);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asignaciones');
    XLSX.writeFile(wb, 'asignaciones-intensificacion.xlsx');
}
```

### 7. ACTUALIZAR FUNCIÓN mostrarHorarios()

Reemplazar la función `mostrarHorarios()` (línea ~230) con:

```javascript
function mostrarHorarios() {
    if(profesores.length === 0) {
        document.getElementById('listaHorarios').innerHTML = 'No hay horarios cargados aun.';
        return;
    }
    
    let html = '<table><tr><th>Profesor</th><th>Materia</th><th>Año</th><th>Curso</th><th>Dia</th><th>Horario</th><th>Turno</th><th>Cupo</th></tr>';
    profesores.forEach(p => {
        html += `<tr><td>${p.nombre}</td><td>${p.materia}</td><td>${p.anio}°</td><td>${p.curso}</td><td>${p.dia}</td><td>${p.horario}</td><td>${p.turno}</td><td>${p.asignados}/${p.capacidad}</td></tr>`;
    });
    html += '</table>';
    document.getElementById('listaHorarios').innerHTML = html;
}
```

---

## FORMATO ARCHIVO EXCEL PARA IMPORTAR:

Crea un archivo Excel con estas columnas (nombres exactos):

| Nombre | Materia | Anio | Curso | Turno | Dia | Horario | Capacidad |
|--------|---------|------|-------|-------|-----|---------|------------|
| Maria Lopez | Lengua | 3 | A | Tarde | Martes | 14:00-16:00 | 5 |
| Juan Perez | Matematica | 4 | B | Manana | Lunes | 8:00-10:00 | 8 |

---

## COMO APLICAR LOS CAMBIOS:

1. Descarga el archivo actual index.html
2. Abrelo en un editor de texto
3. Aplica cada cambio según las secciones numeradas arriba
4. Guarda el archivo
5. Sube el archivo actualizado a GitHub
6. Espera 1-2 minutos a que GitHub Pages se actualice

¡Listo! Tu sistema tendrá importación/exportación Excel completa.
