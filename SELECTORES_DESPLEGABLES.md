SELECTORES_DESPLEGABLES.md# Convertir Campos a Selectores Desplegables

## Objetivo

Cambiar los campos de texto "Nombre del Profesor" y "Materia" en la pestaña "Cargar Profesores" a selectores desplegables (dropdown) con las opciones de los datos pre-cargados.

## Profesores y Materias de las Planillas

Basado en los 30 profesores pre-cargados:

**Profesores únicos:**
- Castillo Raul
- Diaz Roberto
- Fernandez Ana
- Garcia Paula
- Gonzalez Juan
- Lopez Carlos
- Martinez Laura
- Morales Veronica
- Navarro Lucia
- Perez Sofia
- Rodriguez Maria
- Romero Javier
- Ruiz Claudia
- Silva Daniel
- Torres Miguel

**Materias únicas:**
- Biologia
- Educacion Fisica
- Fisica
- Geografia
- Historia
- Ingles
- Lengua
- Matematica
- Quimica

---

## Cambios en index.html

### 1. Reemplazar campo "Nombre del Profesor" (Línea ~58)

**BUSCAR:**
```html
<label>Nombre del Profesor</label>
<input type="text" id="nombre" placeholder="Ej: Juan Perez" required>
```

**REEMPLAZAR POR:**
```html
<label>Nombre del Profesor</label>
<select id="nombre" required>
    <option value="">Seleccionar...</option>
    <option value="Castillo Raul">Castillo Raul</option>
    <option value="Diaz Roberto">Diaz Roberto</option>
    <option value="Fernandez Ana">Fernandez Ana</option>
    <option value="Garcia Paula">Garcia Paula</option>
    <option value="Gonzalez Juan">Gonzalez Juan</option>
    <option value="Lopez Carlos">Lopez Carlos</option>
    <option value="Martinez Laura">Martinez Laura</option>
    <option value="Morales Veronica">Morales Veronica</option>
    <option value="Navarro Lucia">Navarro Lucia</option>
    <option value="Perez Sofia">Perez Sofia</option>
    <option value="Rodriguez Maria">Rodriguez Maria</option>
    <option value="Romero Javier">Romero Javier</option>
    <option value="Ruiz Claudia">Ruiz Claudia</option>
    <option value="Silva Daniel">Silva Daniel</option>
    <option value="Torres Miguel">Torres Miguel</option>
</select>
```

---

### 2. Reemplazar campo "Materia" (Línea ~62)

**BUSCAR:**
```html
<label>Materia</label>
<input type="text" id="materia" placeholder="Ej: Matematica" required>
```

**REEMPLAZAR POR:**
```html
<label>Materia</label>
<select id="materia" required>
    <option value="">Seleccionar...</option>
    <option value="Biologia">Biologia</option>
    <option value="Educacion Fisica">Educacion Fisica</option>
    <option value="Fisica">Fisica</option>
    <option value="Geografia">Geografia</option>
    <option value="Historia">Historia</option>
    <option value="Ingles">Ingles</option>
    <option value="Lengua">Lengua</option>
    <option value="Matematica">Matematica</option>
    <option value="Quimica">Quimica</option>
</select>
```

---

## Opcional: Agregar campo "Curso" desplegable

Si también querés que el campo "Curso" (año + división) sea desplegable, podés agregar esto después del campo "Materia":

**AGREGAR:**
```html
<div class="form-group">
    <label>Curso (Año)</label>
    <select id="anio" required>
        <option value="">Seleccionar...</option>
        <option value="4">4to Año</option>
        <option value="5">5to Año</option>
    </select>
</div>

<div class="form-group">
    <label>División</label>
    <select id="curso" required>
        <option value="">Seleccionar...</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="E">E</option>
        <option value="F">F</option>
    </select>
</div>
```

**Y modificar la función guardarProf() para capturar estos valores:**

```javascript
const anio = document.getElementById('anio').value;
const curso = document.getElementById('curso').value;

const prof = { 
    nombre, 
    materia, 
    año: anio,  // Agregar
    curso: curso, // Agregar
    turno, 
    dia, 
    horario, 
    capacidad, 
    asignados: 0 
};
```

---

## Ventajas de usar Selectores

1. ✅ **Sin errores de tipeo** - No se puede escribir mal un nombre
2. ✅ **Más rápido** - Solo hacer click en lugar de escribir
3. ✅ **Consistencia** - Todos los datos con el mismo formato
4. ✅ **Validación automática** - Solo valores válidos
5. ✅ **Mejor UX** - Más fácil de usar en móviles

---

## Para Aplicar

1. Editar `index.html` en GitHub
2. Buscar y reemplazar las 2 secciones indicadas
3. (Opcional) Agregar selectores de Curso
4. Commit y Push
5. Refrescar la página (Ctrl+F5)
