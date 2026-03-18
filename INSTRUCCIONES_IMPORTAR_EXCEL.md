# INSTRUCCIONES PARA IMPORTAR PROFESORES Y ALUMNOS DESDE EXCEL

## Que hace esta funcionalidad

Permite **cargar masivamente** todos los profesores y alumnos desde un archivo Excel o CSV, evitando tener que ingresar uno por uno manualmente.

---

## PASO 1: Preparar tu archivo Excel

### Para PROFESORES (archivo: `profesores.xlsx` o `profesores.csv`)

Crea un archivo Excel con estas columnas **exactamente con estos nombres**:

| Nombre | Materia | Turno | Dia | Horario | Capacidad |
|--------|---------|-------|-----|---------|------------|
| Juan Perez | Matematica | Manana | Lunes | 8:00-10:00 | 5 |
| Maria Lopez | Lengua | Tarde | Martes | 14:00-16:00 | 8 |
| Carlos Gomez | Historia | Noche | Miercoles | 18:00-20:00 | 6 |

**IMPORTANTE:**
- Turno debe ser: `Manana`, `Tarde`, o `Noche`
- Dia debe ser: `Lunes`, `Martes`, `Miercoles`, `Jueves`, `Viernes`
- Capacidad es un numero (cuantos alumnos puede atender)

### Para ALUMNOS (archivo: `alumnos.xlsx` o `alumnos.csv`)

Crea un archivo Excel con estas columnas:

| DNI | Nombre | Previas |
|--------|---------|-------------------------|
| 12345678 | Ana Martinez | Matematica,Lengua |
| 87654321 | Pedro Sanchez | Historia,Geografia,Ingles |
| 11223344 | Laura Ruiz | Matematica |

**IMPORTANTE:**
- DNI: numero del documento
- Previas: materias separadas por comas (max 4 segun reglamento)
- El sistema asignara automaticamente los turnos de manera equitativa

---

## PASO 2: Agregar el codigo al index.html

Abre el archivo `index.html` y sigue estos pasos:

### 2.1 Agregar la libreria SheetJS (antes de `</head>`)

Busca la linea `</head>` y **ANTES** de ella agrega:

```html
<!-- Libreria para leer archivos Excel -->
<script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
```

### 2.2 Agregar estilos para el boton de importar (dentro de `<style>`)

Dentro del bloque `<style>`, al final, agrega:

```css
.btn-import { 
    background: #28a745; 
    margin-left: 10px; 
}
.btn-import:hover { 
    background: #218838; 
}
input[type="file"] { 
    display: none; 
}
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
.file-label:hover { 
    background: #218838; 
    transform: translateY(-2px); 
}
```

### 2.3 Agregar botones de importar en la pestaña de Profesores

Busca esta linea:
```html
<button type="button" class="btn" onclick="guardarProf()">Guardar Profesor</button>
```

Y **DESPUES** de ella agrega:

```html
<label for="fileProf" class="file-label">📁 Importar desde Excel</label>
<input type="file" id="fileProf" accept=".xlsx,.xls,.csv" onchange="importarProfesores(event)">
```

### 2.4 Agregar botones de importar en la pestaña de Alumnos

Busca esta linea:
```html
<button type="button" class="btn" onclick="asignarAlumno()">Asignar Turnos</button>
```

Y **DESPUES** de ella agrega:

```html
<label for="fileAlum" class="file-label">📁 Importar Alumnos desde Excel</label>
<input type="file" id="fileAlum" accept=".xlsx,.xls,.csv" onchange="importarAlumnos(event)">
```

### 2.5 Agregar funciones JavaScript (antes de `</script>`)

Busca la linea `}; </script>` al final del archivo y **ANTES** de `</script>` agrega:

```javascript

// FUNCIONES PARA IMPORTAR DESDE EXCEL

function importarProfesores(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);
        
        let count = 0;
        rows.forEach(row => {
            // Validar que tenga los campos necesarios
            if (row.Nombre && row.Materia && row.Turno && row.Dia && row.Horario && row.Capacidad) {
                const prof = {
                    nombre: row.Nombre,
                    materia: row.Materia,
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
        document.getElementById('fileProf').value = ''; // Limpiar input
    };
    reader.readAsArrayBuffer(file);
}

function importarAlumnos(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);
        
        if (profesores.length === 0) {
            alert('❌ Primero debes cargar profesores!');
            return;
        }
        
        let countTotal = 0;
        let countExitosos = 0;
        
        rows.forEach(row => {
            if (row.DNI && row.Nombre && row.Previas) {
                countTotal++;
                const dni = row.DNI.toString();
                const nombre = row.Nombre;
                const previasInput = row.Previas.toString();
                const previas = previasInput.split(',').map(p => p.trim()).slice(0, 4);
                
                let asignadoOk = false;
                
                for (let previa of previas) {
                    let disponibles = profesores.filter(p => 
                        p.materia.toLowerCase().includes(previa.toLowerCase()) && 
                        p.asignados < p.capacidad
                    );
                    
                    if (disponibles.length > 0) {
                        disponibles.sort((a, b) => a.asignados - b.asignados);
                        const elegido = disponibles[0];
                        elegido.asignados++;
                        
                        asignaciones.push({
                            dni, nombre, materia: previa,
                            profesor: elegido.nombre,
                            dia: elegido.dia,
                            horario: elegido.horario,
                            turno: elegido.turno
                        });
                        asignadoOk = true;
                    }
                }
                
                if (asignadoOk) countExitosos++;
            }
        });
        
        localStorage.setItem('profesores', JSON.stringify(profesores));
        localStorage.setItem('asignaciones', JSON.stringify(asignaciones));
        
        alert(`✅ Se procesaron ${countTotal} alumnos. ${countExitosos} asignados exitosamente!`);
        document.getElementById('fileAlum').value = ''; // Limpiar input
    };
    reader.readAsArrayBuffer(file);
}
```

---

## PASO 3: Guardar y probar

1. Guarda el archivo `index.html` modificado
2. Sube los cambios a GitHub:
   ```bash
   git add index.html
   git commit -m "Agregar importacion masiva Excel"
   git push
   ```
3. Espera 1-2 minutos a que GitHub Pages se actualice
4. Abre tu pagina: `https://cristianz10.github.io/turnos-intensificacion/`
5. Prueba importando tus archivos Excel!

---

## Como usar en la pagina web

### Importar Profesores:
1. Ve a la pestaña "Cargar Profesores"
2. Haz clic en "📁 Importar desde Excel"
3. Selecciona tu archivo `profesores.xlsx`
4. ✅ Se cargarán todos automáticamente
5. Ve a "Ver Horarios" para verificar

### Importar Alumnos:
1. **Primero** debes tener profesores cargados
2. Ve a la pestaña "Asignar Alumno"
3. Haz clic en "📁 Importar Alumnos desde Excel"
4. Selecciona tu archivo `alumnos.xlsx`
5. ✅ El sistema asignará turnos automáticamente de forma equitativa

---

## Plantillas de ejemplo

Puedes descargar plantillas de ejemplo desde:
- [Plantilla Profesores](plantilla-profesores.xlsx)
- [Plantilla Alumnos](plantilla-alumnos.xlsx)

O crea tus propios archivos siguiendo el formato indicado arriba.

---

## Solución de problemas

**Error: "Se importaron 0 profesores"**
- Verifica que las columnas tengan **exactamente** los nombres indicados
- Revisa que no haya espacios extras en los nombres de columnas

**Error: "Primero debes cargar profesores"**
- Importa primero el archivo de profesores
- Verifica que se hayan cargado en "Ver Horarios"

**No se asignan todos los alumnos**
- Verifica que haya suficiente capacidad en los profesores
- Revisa que las materias coincidan (el sistema busca por nombre)

---

## Bonus: Exportar asignaciones a Excel

Si quieres agregar también la funcionalidad de **exportar** las asignaciones:

### Agregar botón en pestaña "Ver Horarios"

```html
<button class="btn" onclick="exportarAsignaciones()">📊 Exportar Asignaciones a Excel</button>
```

### Agregar función JavaScript

```javascript
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

---

¡Listo! Ahora tu sistema puede importar cientos de profesores y alumnos en segundos.
