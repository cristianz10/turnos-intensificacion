# Selector Desplegable de Materias Previas con Curso

## Problema Actual

El campo **"Materias Previas (separadas por comas, max 4)"** es un campo de texto libre donde el usuario debe escribir manualmente las materias. 

**Problemas:**
- Permite errores de tipeo
- No especifica el año y curso de cada materia
- No aprovecha los datos que ya están en las planillas

**Ejemplo actual:** `Matematica,Lengua,Historia`

---

## Solución

Reemplazar el campo de texto por un **selector múltiple desplegable** que muestre todas las combinaciones de **"Materia + Año + Curso"** disponibles en las planillas.

**Ejemplo deseado:**
- Matemática 4°A
- Lengua 4°A
- Historia 5°B
- Inglés 4°C
- etc.

---

## Implementación

### Paso 1: Generar lista única de "Materia + Curso" dinámicamente

Agregar esta función DESPUÉS de la función `mostrarHorarios()` (línea ~240):

```javascript
function obtenerMateriasDisponibles() {
    // Crear lista única de materia+año+curso de los datos pre-cargados
    const materiasUnicas = new Set();
    
    profesores.forEach(p => {
        const clave = `${p.materia} ${p.año}°${p.curso}`;
        materiasUnicas.add(clave);
    });
    
    // Convertir Set a Array y ordenar
    return Array.from(materiasUnicas).sort();
}

function cargarSelectorMaterias() {
    const selectMaterias = document.getElementById('previas');
    const materias = obtenerMateriasDisponibles();
    
    // Limpiar opciones existentes
    selectMaterias.innerHTML = '';
    
    materias.forEach(materia => {
        const option = document.createElement('option');
        option.value = materia;
        option.textContent = materia;
        selectMaterias.appendChild(option);
    });
}
```

---

### Paso 2: Reemplazar input de texto por selector múltiple

**BUSCAR (línea ~94):**
```html
<div class="form-group">
    <label>Materias Previas (separadas por comas, max 4)</label>
    <input type="text" id="previas" placeholder="Ej: Matematica,Lengua,Historia" required>
</div>
```

**REEMPLAZAR POR:**
```html
<div class="form-group">
    <label>Materias Previas (seleccionar hasta 4)</label>
    <select id="previas" multiple size="8" required style="height: 200px;">
        <!-- Opciones cargadas dinámicamente -->
    </select>
    <small style="color: #666; display: block; margin-top: 5px;">
        👉 Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar múltiples materias
    </small>
</div>
```

---

### Paso 3: Modificar función asignarAlumno() para obtener valores del selector

**BUSCAR (línea ~182):**
```javascript
const previasInput = document.getElementById('previas').value;

if(!dni || !nombre || !anioAlumno || !cursoAlumno || !previasInput) {
    alert('Por favor completa todos los campos');
    return;
}

const previas = previasInput.split(',').map(p => p.trim()).slice(0, 4);
```

**REEMPLAZAR POR:**
```javascript
const selectPrevias = document.getElementById('previas');
const opcionesSeleccionadas = Array.from(selectPrevias.selectedOptions);

if(!dni || !nombre || !anioAlumno || !cursoAlumno || opcionesSeleccionadas.length === 0) {
    alert('Por favor completa todos los campos');
    return;
}

if(opcionesSeleccionadas.length > 4) {
    alert('Máximo 4 materias previas según reglamento bonaerense');
    return;
}

// Extraer info de cada materia seleccionada (ej: "Matematica 4°A" -> materia="Matematica", año="4", curso="A")
const previas = opcionesSeleccionadas.map(opt => {
    const texto = opt.value; // "Matematica 4°A"
    const match = texto.match(/^(.+?)\s+(\d)°([A-F])$/);
    
    if(match) {
        return {
            texto: texto,
            materia: match[1],
            año: match[2],
            curso: match[3]
        };
    }
    return null;
}).filter(p => p !== null);
```

---

### Paso 4: Modificar el bucle de asignación

**BUSCAR (línea ~195):**
```javascript
for(let previa of previas) {
    let disponibles = profesores.filter(p => 
        p.materia.toLowerCase().includes(previa.toLowerCase()) && 
        p.año === anioAlumno &&
        p.curso === cursoAlumno &&
        (p.asignados || 0) < p.capacidad
    );
```

**REEMPLAZAR POR:**
```javascript
for(let previa of previas) {
    // Buscar profesores que coincidan EXACTAMENTE con materia, año y curso
    let disponibles = profesores.filter(p => 
        p.materia.toLowerCase() === previa.materia.toLowerCase() && 
        p.año === previa.año &&
        p.curso === previa.curso &&
        (p.asignados || 0) < p.capacidad
    );
```

**Y en el resultado (línea ~220):**
```javascript
resultados.push(`${previa.texto}: ✅ ${elegido.nombre} - ${elegido.dia} ${elegido.horario} (${elegido.turno})`);
```

Y para "no hay cupo":
```javascript
resultados.push(`${previa.texto}: ❌ No hay cupo disponible`);
```

---

### Paso 5: Llamar a cargarSelectorMaterias() al cargar la página

**BUSCAR (línea ~280):**
```javascript
window.onload = function() {
    const profGuardados = localStorage.getItem('profesores');
    const asigGuardadas = localStorage.getItem('asignaciones');
    
    if(profGuardados) profesores = JSON.parse(profGuardados);
    if(asigGuardadas) asignaciones = JSON.parse(asigGuardadas);
};
```

**REEMPLAZAR POR:**
```javascript
window.onload = function() {
    const profGuardados = localStorage.getItem('profesores');
    const asigGuardadas = localStorage.getItem('asignaciones');
    
    if(profGuardados) profesores = JSON.parse(profGuardados);
    if(asigGuardadas) asignaciones = JSON.parse(asigGuardadas);
    
    // Cargar selector de materias con los datos pre-cargados
    cargarSelectorMaterias();
};
```

---

## Resultado Esperado

### Antes:
```
Materias Previas (separadas por comas, max 4)
[Campo de texto: "Matematica,Lengua"]
```

### Después:
```
Materias Previas (seleccionar hasta 4)
[□ Biologia 4°A
 □ Biologia 5°A
 ☑ Lengua 4°A
 ☑ Lengua 5°A
 ☑ Matematica 4°A
 □ Matematica 5°B
 ...]
```

### Resultado de asignación:
```
Asignación completada para Jose

Lengua 4°A: ✅ Gonzalez Juan - Lunes 7:30-9:00 (Mañana)
Matematica 4°A: ✅ Rodriguez Maria - Lunes 7:30-9:00 (Mañana)
```

---

## Ventajas

1. ✅ **Sin errores de tipeo** - Solo opciones válidas
2. ✅ **Datos de las planillas** - Usa automáticamente lo que ya está cargado
3. ✅ **Materia + Curso específico** - Cada opción tiene su año y curso
4. ✅ **Selección múltiple visual** - Checkbox para cada materia
5. ✅ **Validación automática** - Máximo 4 materias
6. ✅ **Dinámico** - Si se agregan más profesores, aparecen automáticamente

---

## Para Aplicar

1. Editar `index.html` en GitHub
2. Aplicar los 5 pasos en orden
3. Commit y Push
4. Limpiar cache (Ctrl+Shift+Delete)
5. Refrescar (Ctrl+F5)
6. Probar seleccionando "Lengua 4°A" y "Matematica 4°A"
